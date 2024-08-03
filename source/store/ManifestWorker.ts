import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { Path } from "#path";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import type { DiagnosticsHandler, Manifest } from "./types.js";

interface VersionMetadata {
  dist: { integrity: string; tarball: string };
  version: string;
}

interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, VersionMetadata>;
}

export class ManifestWorker {
  #manifestFilePath: string;
  #npmRegistry: string;
  #onDiagnostics: DiagnosticsHandler;
  #storePath: string;
  #timeout = Environment.timeout * 1000;
  #version = "2";

  constructor(storePath: string, npmRegistry: string, onDiagnostics: DiagnosticsHandler) {
    this.#storePath = storePath;
    this.#npmRegistry = npmRegistry;
    this.#onDiagnostics = onDiagnostics;
    this.#manifestFilePath = Path.join(storePath, "store-manifest.json");
  }

  async #create() {
    const manifest = await this.#load();

    if (manifest != null) {
      await this.persist(manifest);
    }

    return manifest;
  }

  isOutdated(manifest: Manifest, ageTolerance = 0): boolean {
    if (Date.now() - manifest.lastUpdated > 2 * 60 * 60 * 1000 /* 2 hours */ + ageTolerance * 1000) {
      return true;
    }

    return false;
  }

  async #load(options?: { quite?: boolean }) {
    const manifest: Manifest = {
      $version: this.#version,
      lastUpdated: Date.now(),
      npmRegistry: this.#npmRegistry,
      resolutions: {},
      packages: {},
      versions: [],
    };

    let packageMetadata: PackageMetadata | undefined;

    try {
      const response = await fetch(new URL("typescript", this.#npmRegistry), {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        headers: { accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*" },
        signal: AbortSignal.timeout(this.#timeout),
      });

      if (!response.ok) {
        this.#onDiagnostics(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry),
            StoreDiagnosticText.requestFailedWithStatusCode(response.status),
          ]),
        );

        return;
      }

      packageMetadata = (await response.json()) as PackageMetadata;
    } catch (error) {
      if (options?.quite === true) {
        return;
      }

      if (error instanceof Error && error.name === "TimeoutError") {
        this.#onDiagnostics(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry),
            StoreDiagnosticText.requestTimeoutWasExceeded(this.#timeout),
          ]),
        );
      } else {
        this.#onDiagnostics(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry),
            StoreDiagnosticText.maybeNetworkConnectionIssue(),
          ]),
        );
      }

      return;
    }

    for (const [tag, meta] of Object.entries(packageMetadata.versions)) {
      if (/^(4|5)\.\d\.\d$/.test(tag)) {
        manifest.versions.push(tag);

        manifest.packages[tag] = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };
      }
    }

    const minorVersions = [...new Set(manifest.versions.map((version) => version.slice(0, -2)))];

    for (const tag of minorVersions) {
      // TODO use 'findLast()' after dropping support for Node.js 16
      const resolvedVersion = manifest.versions.filter((version) => version.startsWith(tag)).pop();

      if (resolvedVersion != null) {
        manifest.resolutions[tag] = resolvedVersion;
      }
    }

    for (const tag of ["beta", "latest", "next", "rc"]) {
      const version = packageMetadata["dist-tags"][tag];

      if (version != null) {
        manifest.resolutions[tag] = version;

        const meta = packageMetadata.versions[version];

        if (meta != null) {
          manifest.packages[version] = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };
        }
      }
    }

    return manifest;
  }

  async open(options?: { refresh?: boolean }): Promise<Manifest | undefined> {
    let manifest: Manifest | undefined;

    if (!existsSync(this.#manifestFilePath)) {
      return this.#create();
    }

    const manifestText = await fs.readFile(this.#manifestFilePath, { encoding: "utf8" });

    try {
      manifest = JSON.parse(manifestText) as Manifest;
    } catch {
      // the manifest will be removed and recreated
    }

    if (!manifest || manifest.$version !== this.#version) {
      await fs.rm(this.#storePath, { force: true, recursive: true });

      return this.#create();
    }

    if (this.isOutdated(manifest) || options?.refresh === true) {
      const quite = options?.refresh !== true;

      const freshManifest = await this.#load({ quite });

      if (freshManifest != null) {
        await this.persist(freshManifest);

        return freshManifest;
      }
    }

    return manifest;
  }

  async persist(manifest: Manifest): Promise<void> {
    if (!existsSync(this.#storePath)) {
      await fs.mkdir(this.#storePath, { recursive: true });
    }

    await fs.writeFile(this.#manifestFilePath, JSON.stringify(manifest));
  }
}

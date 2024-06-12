import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { Path } from "#path";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, unknown>;
}

export interface Manifest {
  $version?: string | undefined;
  lastUpdated: number;
  resolutions: Record<string, string>;
  versions: Array<string>;
}

export class ManifestWorker {
  #manifestFileName = "store-manifest.json";
  #manifestFilePath: string;
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #registryUrl = new URL("https://registry.npmjs.org");
  #storePath: string;
  #timeout = Environment.timeout * 1000;
  #version = "1";

  constructor(storePath: string, onDiagnostic: (diagnostic: Diagnostic) => void) {
    this.#storePath = storePath;
    this.#onDiagnostic = onDiagnostic;
    this.#manifestFilePath = Path.join(storePath, this.#manifestFileName);
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
      resolutions: {},
      versions: [],
    };

    let packageMetadata: PackageMetadata | undefined;

    try {
      const response = await fetch(new URL("typescript", this.#registryUrl), {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        headers: { accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*" },
        signal: AbortSignal.timeout(this.#timeout),
      });

      if (!response.ok) {
        this.#onDiagnostic(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#registryUrl),
            StoreDiagnosticText.failedWithStatusCode(response.status),
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
        this.#onDiagnostic(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#registryUrl),
            StoreDiagnosticText.setupTimeoutExceeded(this.#timeout),
          ]),
        );
      } else {
        this.#onDiagnostic(
          Diagnostic.error([
            StoreDiagnosticText.failedToFetchMetadata(this.#registryUrl),
            StoreDiagnosticText.maybeNetworkConnectionIssue(),
          ]),
        );
      }

      return;
    }

    manifest.versions = Object.keys(packageMetadata.versions)
      .filter((version) => /^(4|5)\.\d\.\d$/.test(version))
      .sort();

    const minorVersions = [...new Set(manifest.versions.map((version) => version.slice(0, -2)))];

    for (const tag of minorVersions) {
      // TODO use 'findLast()' after dropping support for Node.js 16
      const resolvedVersion = manifest.versions.filter((version) => version.startsWith(tag)).pop();

      if (resolvedVersion != null) {
        manifest.resolutions[tag] = resolvedVersion;
      }
    }

    for (const tagKey of ["beta", "latest", "next", "rc"]) {
      const distributionTagValue = packageMetadata["dist-tags"][tagKey];

      if (distributionTagValue != null) {
        manifest.resolutions[tagKey] = distributionTagValue;
      }
    }

    return manifest;
  }

  async open(options?: { refresh?: boolean }): Promise<Manifest | undefined> {
    let manifest: Manifest | undefined;

    if (!existsSync(this.#manifestFilePath)) {
      return this.#create();
    }

    let manifestText: string | undefined;

    try {
      manifestText = await fs.readFile(this.#manifestFilePath, { encoding: "utf8" });
    } catch (error) {
      this.#onDiagnostic(Diagnostic.fromError("Failed to open store manifest.", error));
    }

    if (manifestText == null) {
      return;
    }

    try {
      manifest = JSON.parse(manifestText) as Manifest;
    } catch {
      // the manifest will be removed and recreated
    }

    if (manifest == null || manifest.$version !== this.#version) {
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

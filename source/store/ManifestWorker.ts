import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { Path } from "#path";
import type { Fetcher } from "./Fetcher.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, unknown>;
}

export interface Manifest {
  $version: string;
  lastUpdated: number;
  resolutions: Record<string, string>;
  versions: Array<string>;
}

export class ManifestWorker {
  #fetcher: Fetcher;
  #manifestFilePath: string;
  #npmRegistry: string;
  #storePath: string;
  #timeout = Environment.timeout * 1000;
  #version = "1";

  constructor(storePath: string, npmRegistry: string, fetcher: Fetcher) {
    this.#storePath = storePath;
    this.#npmRegistry = npmRegistry;
    this.#fetcher = fetcher;

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
    const diagnostic = Diagnostic.error(StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry));

    const request = new Request(new URL("typescript", this.#npmRegistry), {
      headers: {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        ["Accept"]: "application/vnd.npm.install-v1+json;q=1.0, application/json;q=0.8, */*",
      },
    });

    const response = await this.#fetcher.get(request, this.#timeout, diagnostic, { quite: options?.quite });

    if (!response) {
      return;
    }

    const manifest: Manifest = {
      $version: this.#version,
      lastUpdated: Date.now(),
      resolutions: {},
      versions: [],
    };

    const packageMetadata = (await response.json()) as PackageMetadata;

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

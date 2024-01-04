import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import https from "node:https";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { Path } from "#path";

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
  #prune: () => Promise<void>;
  #registryUrl = new URL("https://registry.npmjs.org");
  #storePath: string;
  #timeout = Environment.timeout * 1000;
  readonly #version = "1";

  constructor(storePath: string, onDiagnostic: (diagnostic: Diagnostic) => void, prune: () => Promise<void>) {
    this.#storePath = storePath;
    this.#onDiagnostic = onDiagnostic;
    this.#manifestFilePath = Path.join(storePath, this.#manifestFileName);
    this.#prune = prune;
  }

  async #create(signal?: AbortSignal) {
    const manifest = await this.#load(signal);

    if (manifest != null) {
      await this.persist(manifest);
    }

    return manifest;
  }

  async #fetch(signal?: AbortSignal) {
    return new Promise<PackageMetadata>((resolve, reject) => {
      const request = https.get(
        new URL("typescript", this.#registryUrl),
        {
          // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
          headers: { accept: "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*" },
          signal,
        },
        (result) => {
          if (result.statusCode !== 200) {
            reject(new Error(`Request failed with status code ${String(result.statusCode)}.`));

            return;
          }

          result.setEncoding("utf8");

          let rawData = "";

          result.on("data", (chunk) => {
            rawData += chunk;
          });

          result.on("end", () => {
            try {
              const packageMetadata = JSON.parse(rawData) as PackageMetadata;
              resolve(packageMetadata);
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      request.on("error", (error) => {
        reject(error);
      });
    });
  }

  isOutdated(manifest: Manifest, ageTolerance = 0): boolean {
    if (Date.now() - manifest.lastUpdated > 2 * 60 * 60 * 1000 /* 2 hours */ + ageTolerance * 1000) {
      return true;
    }

    return false;
  }

  async #load(signal?: AbortSignal, options: { quite: boolean } = { quite: false }) {
    const manifest: Manifest = {
      $version: this.#version,
      lastUpdated: Date.now(),
      resolutions: {},
      versions: [],
    };

    let packageMetadata: PackageMetadata | undefined;

    // TODO use 'AbortSignal.any()' after dropping support for Node.js 18
    const abortController = new AbortController();

    const timeoutSignal = AbortSignal.timeout(this.#timeout);
    timeoutSignal.addEventListener(
      "abort",
      () => {
        abortController.abort(`Setup timeout of ${this.#timeout / 1000}s was exceeded.`);
      },
      { once: true },
    );

    signal?.addEventListener(
      "abort",
      () => {
        abortController.abort("Fetch got canceled by request.");
      },
      { once: true },
    );

    try {
      packageMetadata = await this.#fetch(abortController.signal);
    } catch (error) {
      if (!options.quite) {
        const text = [`Failed to fetch metadata of the 'typescript' package from '${this.#registryUrl.href}'.`];

        if (error instanceof Error && error.name !== "AbortError") {
          text.push("Might be there is an issue with the registry or the network connection.");
        }

        this.#onDiagnostic(Diagnostic.fromError(text, error));
      }
    }

    if (!packageMetadata) {
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

  async open(signal?: AbortSignal, options?: { refresh?: boolean }): Promise<Manifest | undefined> {
    let manifest: Manifest | undefined;

    if (!existsSync(this.#manifestFilePath)) {
      return this.#create(signal);
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
      await this.#prune();

      return this.#create(signal);
    }

    if (this.isOutdated(manifest) || options?.refresh === true) {
      const quite = options?.refresh !== true;

      const freshManifest = await this.#load(signal, { quite });

      if (freshManifest != null) {
        manifest = { ...manifest, ...freshManifest };
        await this.persist(manifest);
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

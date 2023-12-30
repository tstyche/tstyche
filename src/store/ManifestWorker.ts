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
  lastUpdated: number;
  resolutions: Record<string, string>;
  versions: Array<string>;
}

export class ManifestWorker {
  #cachePath: string;
  #manifestFileName = "store-manifest.json";
  #manifestFilePath: string;
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #prune: () => Promise<void>;
  #registryUrl = new URL("https://registry.npmjs.org");
  #timeout = Environment.timeout * 1000;

  constructor(cachePath: string, onDiagnostic: (diagnostic: Diagnostic) => void, prune: () => Promise<void>) {
    this.#cachePath = cachePath;
    this.#onDiagnostic = onDiagnostic;
    this.#manifestFilePath = Path.join(cachePath, this.#manifestFileName);
    this.#prune = prune;
  }

  async #fetch(signal?: AbortSignal) {
    return new Promise<PackageMetadata>((resolve, reject) => {
      const request = https.get(
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        new URL("typescript", this.#registryUrl),
        {
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

  async #load(signal?: AbortSignal, isUpdate = false) {
    const manifest: Manifest = {
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
        abortController.abort(`Fetch got canceled by request.`);
      },
      { once: true },
    );

    try {
      packageMetadata = await this.#fetch(abortController.signal);
    } catch (error) {
      if (!isUpdate) {
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

  async open(signal?: AbortSignal): Promise<Manifest | undefined> {
    let manifest: Manifest | undefined;

    if (!existsSync(this.#manifestFilePath)) {
      manifest = await this.#load(signal);

      if (manifest == null) {
        return;
      }

      await this.persist(manifest);

      return manifest;
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
    } catch (error) {
      this.#onDiagnostic(
        Diagnostic.fromError(
          [
            `Failed to parse '${this.#manifestFilePath}'.`,
            "Cached files appeared to be corrupt and got removed. Try running 'tstyche' again.",
          ],
          error,
        ),
      );
    }

    if (manifest == null) {
      await this.#prune();

      return;
    }

    if (this.isOutdated(manifest)) {
      manifest = await this.update(manifest, signal);
    }

    return manifest;
  }

  async persist(manifest: Manifest): Promise<void> {
    if (!existsSync(this.#cachePath)) {
      await fs.mkdir(this.#cachePath, { recursive: true });
    }

    await fs.writeFile(this.#manifestFilePath, JSON.stringify(manifest));
  }

  async update(manifest: Manifest, signal?: AbortSignal): Promise<Manifest> {
    const freshManifest = await this.#load(signal, /* isUpdate */ true);

    if (freshManifest != null) {
      manifest = { ...manifest, ...freshManifest };
      await this.persist(manifest);
    }

    return manifest;
  }
}

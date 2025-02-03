import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { Path } from "#path";
import type { Fetcher } from "./Fetcher.js";
import { Manifest } from "./Manifest.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, { dist: { integrity: string; tarball: string } }>;
}

export class ManifestService {
  #fetcher: Fetcher;
  #manifestFilePath: string;
  #npmRegistry: string;
  #storePath: string;
  #supportedVersionRegex = /^(5)\.\d\.\d$/;

  constructor(storePath: string, npmRegistry: string, fetcher: Fetcher) {
    this.#storePath = storePath;
    this.#npmRegistry = npmRegistry;
    this.#fetcher = fetcher;

    this.#manifestFilePath = Path.join(storePath, "store-manifest.json");
  }

  async #create() {
    const manifest = await this.#load();

    if (manifest != null) {
      await this.#persist(manifest);
    }

    return manifest;
  }

  async #load(options?: { suppressErrors?: boolean }) {
    const diagnostic = Diagnostic.error(StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry));

    const request = new Request(new URL("typescript", this.#npmRegistry), {
      headers: {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        ["Accept"]: "application/vnd.npm.install-v1+json;q=1.0, application/json;q=0.8, */*",
      },
    });

    const response = await this.#fetcher.get(request, diagnostic, { suppressErrors: options?.suppressErrors });

    if (!response) {
      return;
    }

    const resolutions: Manifest["resolutions"] = {};
    const packages: Manifest["packages"] = {};
    const versions: Manifest["versions"] = [];

    const packageMetadata = (await response.json()) as PackageMetadata;

    for (const [tag, meta] of Object.entries(packageMetadata.versions)) {
      if (this.#supportedVersionRegex.test(tag)) {
        versions.push(tag);

        packages[tag] = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };
      }
    }

    const minorVersions = [...new Set(versions.map((version) => version.slice(0, -2)))];

    for (const tag of minorVersions) {
      const resolvedVersion = versions.findLast((version) => version.startsWith(tag));

      if (resolvedVersion != null) {
        resolutions[tag] = resolvedVersion;
      }
    }

    for (const tag of ["beta", "latest", "next", "rc"]) {
      const version = packageMetadata["dist-tags"][tag];

      if (version != null) {
        resolutions[tag] = version;

        const meta = packageMetadata.versions[version];

        if (meta != null) {
          packages[version] = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };
        }
      }
    }

    return new Manifest({ minorVersions, npmRegistry: this.#npmRegistry, packages, resolutions, versions });
  }

  async open(options?: { refresh?: boolean }): Promise<Manifest | undefined> {
    if (!existsSync(this.#manifestFilePath)) {
      return this.#create();
    }

    const manifestText = await fs.readFile(this.#manifestFilePath, { encoding: "utf8" });
    const manifest = Manifest.parse(manifestText);

    if (!manifest || manifest.npmRegistry !== this.#npmRegistry) {
      await this.prune();

      return this.#create();
    }

    if (manifest.isOutdated() || options?.refresh) {
      // error events are dispatched only when manifest refresh is requested explicitly (e.g. via the '--update' option)
      const freshManifest = await this.#load({ suppressErrors: !options?.refresh });

      if (freshManifest != null) {
        await this.#persist(freshManifest);

        return freshManifest;
      }
    }

    return manifest;
  }

  async #persist(manifest: Manifest): Promise<void> {
    if (!existsSync(this.#storePath)) {
      await fs.mkdir(this.#storePath, { recursive: true });
    }

    await fs.writeFile(this.#manifestFilePath, manifest.stringify());
  }

  async prune(): Promise<void> {
    await fs.rm(this.#storePath, { force: true, recursive: true });
  }
}

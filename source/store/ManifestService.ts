import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import process from "node:process";
import { Diagnostic } from "#diagnostic";
import { Path } from "#path";
import { Version } from "#version";
import type { Fetcher } from "./Fetcher.js";
import { Manifest } from "./Manifest.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

interface VersionMetadata {
  dist: { integrity: string; tarball: string };
  optionalDependencies: Record<string, string>;
}

interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, VersionMetadata>;
}

export class ManifestService {
  #fetcher: Fetcher;
  #manifestFilePath: string;
  #npmRegistry: string;
  #storePath: string;

  constructor(storePath: string, npmRegistry: string, fetcher: Fetcher) {
    this.#storePath = storePath;
    this.#npmRegistry = npmRegistry;
    this.#fetcher = fetcher;

    this.#manifestFilePath = Path.join(storePath, "store-manifest.json");
  }

  async #create(options?: { preview?: boolean | undefined }) {
    const manifest = await this.#fetch({ preview: options?.preview });

    if (manifest != null) {
      await this.#persist(manifest);
    }

    return manifest;
  }

  async #fetchPackageMetadata(packageName: string, options?: { suppressErrors?: boolean | undefined }) {
    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchMetadata(this.#npmRegistry));

    const request = new Request(new URL(packageName, this.#npmRegistry), {
      headers: {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        ["Accept"]: "application/vnd.npm.install-v1+json;q=1.0, application/json;q=0.8, */*",
      },
    });

    const response = await this.#fetcher.get(request, diagnostic, { suppressErrors: options?.suppressErrors });

    if (!response) {
      return;
    }

    return (await response.json()) as PackageMetadata;
  }

  async #fetch(options?: { preview?: boolean | undefined; suppressErrors?: boolean | undefined }) {
    const packageMetadata = await this.#fetchPackageMetadata("typescript", { suppressErrors: options?.suppressErrors });

    if (!packageMetadata) {
      return;
    }

    const resolutions: Manifest["resolutions"] = {};
    const packages: Manifest["packages"] = {};
    const versions: Manifest["versions"] = [];

    for (const [tag, meta] of Object.entries(packageMetadata.versions)) {
      if (
        !tag.includes("-") &&
        Version.isSatisfiedWith(tag, "5.4") &&
        // TODO remove after adding support for TypeScript 7
        !Version.isSatisfiedWith(tag, "7.0")
      ) {
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

    // TODO remove after adding support for TypeScript 7
    resolutions["latest"] = versions.findLast((version) => version.startsWith("6"))!;

    // TODO roughly this logic must add binary resource for each TypeScript version that has 'optionalDependencies'
    if (options?.preview) {
      const packageMetadata = await this.#fetchPackageMetadata("@typescript/native-preview", {
        suppressErrors: options?.suppressErrors,
      });

      if (packageMetadata != null) {
        const latest = packageMetadata["dist-tags"]["latest"]!;
        const meta = packageMetadata.versions[latest]!;

        packages["preview"] = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };

        const packageBinaryName = `@typescript/native-preview-${process.platform}-${process.arch}`;
        const packageBinaryVersion = meta.optionalDependencies[packageBinaryName];

        if (packageBinaryVersion != null) {
          const packageMetadata = await this.#fetchPackageMetadata(packageBinaryName, {
            suppressErrors: options?.suppressErrors,
          });

          // TODO Error: "Unable to resolve " + binaryPackageName + ". The package is missing in the registry."

          const meta = packageMetadata?.versions[packageBinaryVersion];

          // TODO Error: "Unable to resolve " + binaryPackageName + ". Your platform is not supported."

          if (meta != null) {
            packages["preview"].binary = { integrity: meta.dist.integrity, tarball: meta.dist.tarball };
          }
        }
      }
    }

    return new Manifest({
      minorVersions,
      npmRegistry: this.#npmRegistry,
      packages,
      resolutions,
      versions,
    });
  }

  async open(options?: {
    preview?: boolean | undefined;
    refresh?: boolean | undefined;
  }): Promise<Manifest | undefined> {
    if (!existsSync(this.#manifestFilePath)) {
      return this.#create({ preview: options?.preview });
    }

    const manifestText = await fs.readFile(this.#manifestFilePath, { encoding: "utf8" });
    const manifest = Manifest.parse(manifestText);

    if (!manifest || manifest.npmRegistry !== this.#npmRegistry) {
      await this.prune();

      return this.#create({ preview: options?.preview });
    }

    if (manifest.isOutdated() || options?.refresh) {
      // error events are dispatched only when manifest refresh is requested explicitly (e.g. via the '--update' option)
      const freshManifest = await this.#fetch({ preview: options?.preview, suppressErrors: !options?.refresh });

      if (freshManifest != null) {
        await this.#persist(freshManifest);

        return freshManifest;
      }
    }

    return manifest;
  }

  async #persist(manifest: Manifest): Promise<void> {
    await fs.mkdir(this.#storePath, { recursive: true });
    await fs.writeFile(this.#manifestFilePath, manifest.stringify());
  }

  async prune(): Promise<void> {
    await fs.rm(this.#storePath, { force: true, recursive: true });
  }
}

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Version } from "#version";
import type { Fetcher, VersionMetadata } from "./Fetcher.js";
import type { LockService } from "./LockService.js";
import type { Manifest, Resource } from "./Manifest.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import { TarReader } from "./TarReader.js";

export class PackageService {
  #onDiagnostics: DiagnosticsHandler;
  #fetcher: Fetcher;
  #lockService: LockService;
  #storePath: string;

  constructor(onDiagnostics: DiagnosticsHandler, storePath: string, fetcher: Fetcher, lockService: LockService) {
    this.#onDiagnostics = onDiagnostics;
    this.#storePath = storePath;
    this.#fetcher = fetcher;
    this.#lockService = lockService;
  }

  async ensure(packageVersion: string, manifest: Manifest): Promise<string | undefined> {
    const packageSpecifier = `typescript@${packageVersion}`;
    const packagePath = Path.join(this.#storePath, packageSpecifier);
    const packageUrl = `${pathToFileURL(packagePath)}/`;

    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageSpecifier));

    if (await this.#lockService.isLocked(packagePath, diagnostic)) {
      return;
    }

    if (existsSync(packagePath)) {
      return packageUrl;
    }

    EventEmitter.dispatch(["store:adds", { packagePath, packageVersion }]);

    const packageResource = manifest.packages[packageVersion]!;
    const lock = this.#lockService.getLock(packagePath);

    let tempPath: string | undefined;

    try {
      // TODO use 'fs.mkdtempDisposable()' after dropping support for Node.js 22
      // await using temp = await fs.mkdtempDisposable(`${packagePath}-`);

      tempPath = await fs.mkdtemp(`${packagePath}-`);

      const packageJson = await this.#fetch(tempPath, packageSpecifier, packageResource);

      if (!packageJson) {
        return;
      }

      if (Version.isSatisfiedWith(packageVersion, "7.0")) {
        const binaryPackageJson = await this.#fetchBinary(tempPath, packageVersion, packageJson);

        if (!binaryPackageJson) {
          return;
        }
      }

      await fs.rename(tempPath, packagePath);
    } finally {
      if (tempPath != null) {
        await fs.rm(tempPath, { recursive: true, force: true });
      }

      lock.release();
    }

    return packageUrl;
  }

  async #fetch(
    packagePath: string,
    packageSpecifier: string,
    packageResource: Resource,
  ): Promise<Uint8Array | undefined> {
    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageSpecifier));

    const request = new Request(packageResource.tarball, { integrity: packageResource.integrity });
    const response = await this.#fetcher.get(request, diagnostic);

    if (!response?.body) {
      return;
    }

    let packageJson: Uint8Array | undefined;

    const stream = response.body.pipeThrough<Uint8Array>(new DecompressionStream("gzip"));
    const tarReader = new TarReader(stream);

    for await (const file of tarReader.extract()) {
      const fileName = file.name.replace(/^package\//, "");
      const filePath = Path.join(packagePath, fileName);
      const directoryPath = Path.dirname(filePath);

      if (fileName === "package.json") {
        packageJson = file.content;
      }

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(filePath, file.content);

      if ((file.mode & fs.constants.S_IXUSR) !== 0) {
        await fs.chmod(filePath, file.mode);
      }
    }

    return packageJson;
  }

  async #fetchBinary(
    tempPath: string,
    packageVersion: string,
    packageJson: Uint8Array,
  ): Promise<Uint8Array | undefined> {
    const { optionalDependencies } = JSON.parse(new TextDecoder("utf-8").decode(packageJson)) as {
      optionalDependencies?: Record<string, string>;
    };

    const binaryName = `@typescript/typescript-${process.platform}-${process.arch}`;
    const binaryVersion = optionalDependencies?.[binaryName];

    if (!binaryVersion) {
      this.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.platformIsNotSupported(packageVersion)));

      return;
    }

    const metadata = await this.#fetcher.getMetadata<VersionMetadata>(`${binaryName}/${binaryVersion}`);

    if (!metadata) {
      return;
    }

    const binaryPath = Path.join(tempPath, "node_modules", binaryName);
    const binarySpecifier = `${binaryName}@${binaryVersion}`;

    return this.#fetch(binaryPath, binarySpecifier, metadata.dist);
  }
}

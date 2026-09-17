import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { Fetcher } from "./Fetcher.js";
import type { LockService } from "./LockService.js";
import type { Manifest, Resource } from "./Manifest.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import { TarReader } from "./TarReader.js";

export class PackageService {
  #fetcher: Fetcher;
  #lockService: LockService;
  #storePath: string;

  constructor(storePath: string, fetcher: Fetcher, lockService: LockService) {
    this.#storePath = storePath;
    this.#fetcher = fetcher;
    this.#lockService = lockService;
  }

  async ensure(packageVersion: string, manifest: Manifest): Promise<string | undefined> {
    const packageSpecifier = `typescript@${packageVersion}`;
    const packagePath = Path.join(this.#storePath, packageSpecifier);

    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageSpecifier));

    if (await this.#lockService.isLocked(packagePath, diagnostic)) {
      return;
    }

    if (!existsSync(packagePath)) {
      EventEmitter.dispatch(["store:adds", { packagePath, packageVersion }]);

      const resource = manifest.packages[packageVersion]!;

      let success = await this.#fetch(packagePath, packageSpecifier, resource);

      if (success && resource.binary) {
        const binaryPackagePath = Path.join(packagePath, "node_modules", resource.binary.name);
        const binaryPackageSpecifier = `${resource.binary.name}@${packageVersion}`;

        success = await this.#fetch(binaryPackagePath, binaryPackageSpecifier, resource.binary);
      }

      if (!success) {
        await fs.rm(packagePath, { recursive: true, force: true });

        return;
      }
    }

    return `${pathToFileURL(packagePath)}/`;
  }

  async #fetch(packagePath: string, packageSpecifier: string, resource: Resource): Promise<boolean> {
    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageSpecifier));

    const lock = this.#lockService.getLock(packagePath);

    try {
      const request = new Request(resource.tarball, { integrity: resource.integrity });
      const response = await this.#fetcher.get(request, diagnostic);

      if (!response?.body) {
        return false;
      }

      const targetPath = await fs.mkdtemp(`${packagePath}-`);

      const stream = response.body.pipeThrough<Uint8Array>(new DecompressionStream("gzip"));
      const tarReader = new TarReader(stream);

      for await (const file of tarReader.extract()) {
        const filePath = Path.join(targetPath, file.name.replace(/^package\//, ""));
        const directoryPath = Path.dirname(filePath);

        await fs.mkdir(directoryPath, { recursive: true });
        await fs.writeFile(filePath, file.content);

        if ((file.mode & fs.constants.S_IXUSR) !== 0) {
          await fs.chmod(filePath, file.mode);
        }
      }

      await fs.rename(targetPath, packagePath);

      return true;
    } finally {
      lock.release();
    }
  }
}

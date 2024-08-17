import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { Fetcher } from "./Fetcher.js";
import type { LockService } from "./LockService.js";
import type { Manifest } from "./Manifest.js";
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

  async #add(targetPath: string, resource: { integrity: string; tarball: string }, diagnostic: Diagnostic) {
    const request = new Request(resource.tarball, { integrity: resource.integrity });

    const response = await this.#fetcher.get(request, diagnostic);

    if (response?.body != null) {
      const decompressedStream = response.body.pipeThrough<Uint8Array>(new DecompressionStream("gzip"));

      for await (const file of TarReader.extract(decompressedStream)) {
        // TODO remove this check after dropping support for TypeScript 4.8
        if (!file.name.startsWith("package/")) {
          continue;
        }

        const filePath = Path.join(targetPath, file.name.replace("package/", ""));
        const directoryPath = Path.dirname(filePath);

        if (!existsSync(directoryPath)) {
          await fs.mkdir(directoryPath, { recursive: true });
        }

        await fs.writeFile(filePath, file.contents);
      }
    }
  }

  async ensure(packageVersion: string, manifest?: Manifest): Promise<string | undefined> {
    const packagePath = Path.join(this.#storePath, `typescript@${packageVersion}`);
    const readyFilePath = Path.join(packagePath, "__ready__");
    // TODO at some point return 'packagePath' instead of 'modulePath'
    const modulePath = Path.join(packagePath, "lib", "typescript.js");

    if (existsSync(readyFilePath)) {
      return modulePath;
    }

    EventEmitter.dispatch(["store:adds", { packagePath, packageVersion }]);

    const diagnostic = Diagnostic.error(StoreDiagnosticText.failedToInstalTypeScript(packageVersion));
    const resource = manifest?.packages[packageVersion];

    if (await this.#lockService.isLocked(packagePath, diagnostic)) {
      return;
    }

    if (resource != null) {
      const lock = this.#lockService.getLock(packagePath);

      try {
        await this.#add(packagePath, resource, diagnostic);

        // TODO if package was not added, do not mark it 'ready'
        await fs.writeFile(readyFilePath, "");
      } finally {
        lock.release();
      }

      // TODO if package was not added, do not return 'modulePath'
      return modulePath;
    }

    return;
  }
}

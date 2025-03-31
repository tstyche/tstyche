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

  async #add(packagePath: string, resource: { integrity: string; tarball: string }, diagnostic: Diagnostic) {
    const request = new Request(resource.tarball, { integrity: resource.integrity });

    const response = await this.#fetcher.get(request, diagnostic);

    if (response?.body != null) {
      const targetPath = `${packagePath}-${Math.random().toString(32).slice(2)}`;

      for await (const file of TarReader.extract(response.body)) {
        const filePath = Path.join(targetPath, file.name.replace("package/", ""));
        const directoryPath = Path.dirname(filePath);

        if (!existsSync(directoryPath)) {
          await fs.mkdir(directoryPath, { recursive: true });
        }

        await fs.writeFile(filePath, file.contents);
      }

      await fs.rename(targetPath, packagePath);

      return packagePath;
    }

    return;
  }

  async ensure(packageVersion: string, manifest?: Manifest): Promise<string | undefined> {
    let packagePath: string | undefined = Path.join(this.#storePath, `typescript@${packageVersion}`);

    const diagnostic = Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageVersion));

    if (await this.#lockService.isLocked(packagePath, diagnostic)) {
      return;
    }

    if (existsSync(packagePath)) {
      return packagePath;
    }

    EventEmitter.dispatch(["store:adds", { packagePath, packageVersion }]);

    const resource = manifest?.packages[packageVersion];

    if (resource != null) {
      const lock = this.#lockService.getLock(packagePath);

      try {
        packagePath = await this.#add(packagePath, resource, diagnostic);
      } finally {
        lock.release();
      }

      return packagePath;
    }

    return;
  }
}

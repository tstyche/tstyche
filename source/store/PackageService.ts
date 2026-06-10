import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { fileNameToDocumentURI } from "@typescript/native-preview/unstable/sync";
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
    const packagePath = Path.join(this.#storePath, `typescript@${packageVersion}`);

    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageVersion));

    if (await this.#lockService.isLocked(packagePath, diagnostic)) {
      return;
    }

    if (!existsSync(packagePath)) {
      EventEmitter.dispatch(["store:adds", { packagePath, packageVersion }]);

      const resource = manifest.packages[packageVersion]!;

      let success = await this.#fetch(packagePath, packageVersion, resource);

      if (success && resource.binary) {
        success = await this.#fetch(`${packagePath}-binary`, `${packageVersion}-binary`, resource.binary);
      }

      if (!success) {
        return;
      }
    }

    return `${fileNameToDocumentURI(packagePath)}/`;
  }

  async #fetch(packagePath: string, packageVersion: string, resource: Resource): Promise<boolean> {
    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchPackage(packageVersion));

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
      }

      await fs.rename(targetPath, packagePath);

      return true;
    } finally {
      lock.release();
    }
  }
}

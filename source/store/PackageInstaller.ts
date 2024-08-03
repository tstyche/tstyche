import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { CancellationToken } from "#token";
import { Fetcher } from "./Fetcher.js";
import { Lock } from "./Lock.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import { TarReader } from "./TarReader.js";
import type { DiagnosticsHandler, Manifest } from "./types.js";

export class PackageInstaller {
  #fetcher: Fetcher;
  #onDiagnostics: DiagnosticsHandler;
  #storePath: string;
  #timeout = Environment.timeout * 1000;

  constructor(storePath: string, onDiagnostics: DiagnosticsHandler) {
    this.#storePath = storePath;
    this.#onDiagnostics = onDiagnostics;

    this.#fetcher = new Fetcher(onDiagnostics);
  }

  async ensure(
    version: string,
    manifest: Manifest,
    cancellationToken?: CancellationToken,
  ): Promise<string | undefined> {
    const installationPath = Path.join(this.#storePath, version);
    const readyFilePath = Path.join(installationPath, "__ready__");
    const modulePath = Path.join(installationPath, "lib", "typescript.js");

    if (existsSync(readyFilePath)) {
      return modulePath;
    }

    const diagnostic = Diagnostic.error(StoreDiagnosticText.failedToInstalTypeScript(version));

    if (
      await Lock.isLocked(installationPath, {
        cancellationToken,
        // TODO 'diagnostic.extendWith()' could be used here too
        onDiagnostics: (text) => {
          this.#onDiagnostics(Diagnostic.error([StoreDiagnosticText.failedToInstalTypeScript(version), text]));
        },
        timeout: this.#timeout,
      })
    ) {
      return;
    }

    EventEmitter.dispatch(["store:info", { compilerVersion: version, installationPath }]);

    const resource = manifest.packages[version];

    if (resource != null) {
      const lock = new Lock(installationPath);

      try {
        await this.#install(installationPath, resource, diagnostic);

        await fs.writeFile(readyFilePath, "");
      } finally {
        lock.release();
      }

      return modulePath;
    }

    return;
  }

  async #install(targetPath: string, resource: { integrity: string; tarball: string }, diagnostic: Diagnostic) {
    const request = new Request(resource.tarball, { integrity: resource.integrity });

    const response = await this.#fetcher.get(request, this.#timeout, diagnostic);

    if (response && response.body != null) {
      const decompressedStream = response.body.pipeThrough<Uint8Array>(new DecompressionStream("gzip"));

      // TODO better consume the stream directly
      const chunks: Array<Uint8Array> = [];

      for await (const chunk of decompressedStream) {
        chunks.push(chunk);
      }

      const decompressedData = await new Blob(chunks).arrayBuffer();

      for (const file of TarReader.extract(decompressedData)) {
        // TODO remove after dropping support for TypeScript 4.8
        if (!file.name.startsWith("package/")) {
          continue;
        }

        const filePath = Path.join(targetPath, file.name.replace("package/", ""));

        await fs.mkdir(Path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.contents);
      }
    }
  }
}

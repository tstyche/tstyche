import process from "node:process";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { sleep } from "./helpers.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export interface VersionMetadata {
  dist: { integrity: string; tarball: string };
  optionalDependencies?: Record<string, string>;
}

export interface PackageMetadata {
  ["dist-tags"]: Record<string, string>;
  modified: string;
  name: string;
  versions: Record<string, VersionMetadata>;
}

export class Fetcher {
  #onDiagnostics: DiagnosticsHandler;
  #registry: string;
  #retries: number;
  #timeout: number;

  constructor(onDiagnostics: DiagnosticsHandler, registry: string, retries: number, timeout: number) {
    this.#onDiagnostics = onDiagnostics;
    this.#registry = registry;
    this.#retries = retries;
    this.#timeout = timeout;
  }

  async get(
    request: Request,
    diagnostic: () => Diagnostic,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<Response | undefined> {
    let delay = 3000;

    request.headers.set("User-Agent", `tstyche/__version__ ${process.platform} ${process.arch}`);

    for (let attempt = 0; attempt <= this.#retries; attempt++) {
      const isLastAttempt = attempt === this.#retries;
      const suppressErrors = options?.suppressErrors || !isLastAttempt;

      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(this.#timeout) });

        if (response.ok) {
          return response;
        }

        // do not retry 4xx, except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          if (options?.suppressErrors) {
            return;
          }

          this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestFailed(response.status)));

          return;
        }

        if (!suppressErrors) {
          this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestFailed(response.status)));
        }
      } catch (error) {
        if (!suppressErrors) {
          if (error instanceof Error && error.name === "TimeoutError") {
            this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestTimeoutWasExceeded(this.#timeout)));
          } else {
            this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.networkFailure(this.#retries)));
          }
        }
      }

      if (!isLastAttempt) {
        await sleep(delay);
        delay *= 2;
      }
    }

    return;
  }

  async getMetadata<T>(
    packageSpecifier: string,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<T | undefined> {
    const diagnostic = () => Diagnostic.error(StoreDiagnosticText.failedToFetchMetadata(this.#registry));

    const request = new Request(new URL(packageSpecifier, this.#registry), {
      headers: {
        // reference: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
        ["Accept"]: "application/vnd.npm.install-v1+json;q=1.0, application/json;q=0.8, */*",
      },
    });

    const response = await this.get(request, diagnostic, { suppressErrors: options?.suppressErrors });

    if (!response) {
      return;
    }

    return (await response.json()) as T;
  }
}

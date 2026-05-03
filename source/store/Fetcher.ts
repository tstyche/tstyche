import type { Diagnostic, DiagnosticsHandler } from "#diagnostic";
import { sleep } from "./helpers.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export class Fetcher {
  #onDiagnostics: DiagnosticsHandler;
  #timeout: number;
  #retries = 2;
  #attempt = 0;

  constructor(onDiagnostics: DiagnosticsHandler, timeout: number) {
    this.#onDiagnostics = onDiagnostics;
    this.#timeout = timeout;
  }

  async get(
    request: Request,
    diagnostic: () => Diagnostic,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<Response | undefined> {
    let delay = 2000;

    for (this.#attempt = 0; this.#attempt <= this.#retries; this.#attempt++) {
      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(this.#timeout) });

        if (response.ok) {
          return response;
        }

        this.#emitDiagnostic(
          diagnostic,
          StoreDiagnosticText.requestFailedWithStatusCode(response.status),
          options?.suppressErrors,
        );
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          this.#emitDiagnostic(
            diagnostic,
            StoreDiagnosticText.requestTimeoutWasExceeded(this.#timeout),
            options?.suppressErrors,
          );
        } else {
          this.#emitDiagnostic(diagnostic, StoreDiagnosticText.maybeNetworkConnectionIssue(), options?.suppressErrors);
        }
      }

      if (this.#attempt < this.#retries) {
        await sleep(delay);
        delay *= 2;
      }
    }

    return;
  }

  #emitDiagnostic(diagnostic: () => Diagnostic, text: string, suppressErrors?: boolean): void {
    if (this.#attempt === this.#retries && !suppressErrors) {
      this.#onDiagnostics(diagnostic().extendWith(text));
    }
  }
}

import type { Diagnostic } from "#diagnostic";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import type { DiagnosticsHandler } from "./types.js";

export class Fetcher {
  #onDiagnostics: DiagnosticsHandler;
  #timeout: number;

  constructor(onDiagnostics: DiagnosticsHandler, timeout: number) {
    this.#onDiagnostics = onDiagnostics;
    this.#timeout = timeout;
  }

  async get(
    request: Request,
    diagnostic: Diagnostic,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<Response | undefined> {
    try {
      const response = await fetch(request, { signal: AbortSignal.timeout(this.#timeout) });

      if (!response.ok) {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestFailedWithStatusCode(response.status)));

        return;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestTimeoutWasExceeded(this.#timeout)));
      } else {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.maybeNetworkConnectionIssue()));
      }
    }

    return;
  }
}

import type { Diagnostic } from "#diagnostic";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import type { DiagnosticsHandler } from "./types.js";

export class Fetcher {
  #onDiagnostics: DiagnosticsHandler;

  constructor(onDiagnostics: DiagnosticsHandler) {
    this.#onDiagnostics = onDiagnostics;
  }

  async get(
    request: Request,
    timeout: number,
    diagnostic: Diagnostic,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<Response | undefined> {
    try {
      const response = await fetch(request, { signal: AbortSignal.timeout(timeout) });

      if (!response.ok) {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestFailedWithStatusCode(response.status)));

        return;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestTimeoutWasExceeded(timeout)));
      } else {
        !options?.suppressErrors &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.maybeNetworkConnectionIssue()));
      }
    }

    return;
  }
}

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
    options?: { quiet?: boolean | undefined },
  ): Promise<Response | undefined> {
    try {
      const response = await fetch(request, { signal: AbortSignal.timeout(timeout) });

      if (!response.ok) {
        !options?.quiet &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestFailedWithStatusCode(response.status)));

        return;
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        !options?.quiet &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.requestTimeoutWasExceeded(timeout)));
      } else {
        !options?.quiet &&
          this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.maybeNetworkConnectionIssue()));
      }
    }

    return;
  }
}

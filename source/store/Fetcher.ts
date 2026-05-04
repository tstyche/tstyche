import type { Diagnostic, DiagnosticsHandler } from "#diagnostic";
import { sleep } from "./helpers.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export class Fetcher {
  #onDiagnostics: DiagnosticsHandler;
  #retries: number;
  #timeout: number;

  constructor(onDiagnostics: DiagnosticsHandler, retries: number, timeout: number) {
    this.#onDiagnostics = onDiagnostics;
    this.#retries = retries;
    this.#timeout = timeout;
  }

  async get(
    request: Request,
    diagnostic: () => Diagnostic,
    options?: { suppressErrors?: boolean | undefined },
  ): Promise<Response | undefined> {
    let attempt = 0;
    let delay = 3000;

    while (attempt <= this.#retries) {
      const isLastAttempt = attempt === this.#retries;
      const suppressErrors = options?.suppressErrors ?? !isLastAttempt;

      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(this.#timeout) });

        if (response.ok) {
          return response;
        }

        // only retry 5xx, 429 (rate limit) or connection error
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          !options?.suppressErrors &&
            this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestFailed(response.status)));

          return;
        }

        !suppressErrors &&
          this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestFailed(response.status)));
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          !suppressErrors &&
            this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.requestTimeoutWasExceeded(this.#timeout)));
        } else {
          !suppressErrors && this.#onDiagnostics(diagnostic().extendWith(StoreDiagnosticText.networkFailure()));
        }
      }

      if (!isLastAttempt) {
        await sleep(delay);
        delay *= 2;
      }

      attempt++;
    }

    return;
  }
}

import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import type { CancellationReason, CancellationToken } from "#token";

export class CancellationHandler implements EventHandler {
  #cancellationToken: CancellationToken;
  #cancellationReason: CancellationReason;

  constructor(cancellationToken: CancellationToken, cancellationReason: CancellationReason) {
    this.#cancellationToken = cancellationToken;
    this.#cancellationReason = cancellationReason;
  }

  handleEvent([, payload]: Event): void {
    if ("diagnostics" in payload) {
      if (payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
        this.#cancellationToken.cancel(this.#cancellationReason);
      }
    }
  }
}

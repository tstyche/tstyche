import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import type { Event } from "#events";
import type { CancellationReason, CancellationToken } from "#token";

export class CancellationHandler {
  #cancellationToken: CancellationToken;
  #cancellationReason: CancellationReason;

  constructor(cancellationToken: CancellationToken, cancellationReason: CancellationReason) {
    this.#cancellationToken = cancellationToken;
    this.#cancellationReason = cancellationReason;
  }

  handleEvent([, payload]: Event & [string, { diagnostics?: Array<Diagnostic> }]): void {
    if (payload.diagnostics?.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
      this.#cancellationToken.cancel(this.#cancellationReason);
    }
  }
}

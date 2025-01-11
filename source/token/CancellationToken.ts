import type { CancellationReason } from "./CancellationReason.enum.js";

export type CancellationRequestedHandler = (reason: CancellationReason) => void;

export class CancellationToken {
  #isCancelled = false;
  #handlers = new Set<CancellationRequestedHandler>();
  #reason: CancellationReason | undefined;

  get isCancellationRequested(): boolean {
    return this.#isCancelled;
  }

  get reason(): CancellationReason | undefined {
    return this.#reason;
  }

  cancel(reason: CancellationReason): void {
    if (!this.#isCancelled) {
      for (const handler of this.#handlers) {
        handler(reason);
      }

      this.#isCancelled = true;
      this.#reason = reason;
    }
  }

  onCancellationRequested(handler: CancellationRequestedHandler): void {
    this.#handlers.add(handler);
  }

  reset(): void {
    if (this.#isCancelled) {
      this.#isCancelled = false;
      this.#reason = undefined;
    }
  }
}

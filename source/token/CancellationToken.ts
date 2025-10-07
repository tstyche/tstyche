import type { CancellationReason } from "./CancellationReason.enum.js";

export class CancellationToken {
  #isCancelled = false;
  #reason: CancellationReason | undefined;

  cancel(reason: CancellationReason): void {
    if (!this.#isCancelled) {
      this.#isCancelled = true;
      this.#reason = reason;
    }
  }

  isCancellationRequested(): boolean {
    return this.#isCancelled;
  }

  getReason(): CancellationReason | undefined {
    return this.#reason;
  }

  reset(): void {
    if (this.#isCancelled) {
      this.#isCancelled = false;
      this.#reason = undefined;
    }
  }
}

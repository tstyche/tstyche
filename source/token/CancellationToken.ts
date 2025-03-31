import type { CancellationReason } from "./CancellationReason.enum.js";

export class CancellationToken {
  #isCancelled = false;
  #reason: CancellationReason | undefined;

  get isCancellationRequested(): boolean {
    return this.#isCancelled;
  }

  get reason(): CancellationReason | undefined {
    return this.#reason;
  }

  cancel(reason: CancellationReason): void {
    if (!this.#isCancelled) {
      this.#isCancelled = true;
      this.#reason = reason;
    }
  }

  reset(): void {
    if (this.#isCancelled) {
      this.#isCancelled = false;
      this.#reason = undefined;
    }
  }
}

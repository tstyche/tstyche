export class CancellationToken {
  #isCancelled = false;

  get isCancellationRequested(): boolean {
    return this.#isCancelled;
  }

  cancel(): void {
    if (!this.#isCancelled) {
      this.#isCancelled = true;
    }
  }
}

export class Debounce {
  #delay: number;
  #resolve: (() => void) | undefined;
  #timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(delay: number) {
    this.#delay = delay;
  }

  clear(): void {
    clearTimeout(this.#timeout);
  }

  resolve(): void {
    this.clear();
    this.#resolve?.();
  }

  refresh(): void {
    this.clear();

    this.#timeout = setTimeout(() => {
      this.#resolve?.();
    }, this.#delay);
  }

  wait(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.#resolve = resolve;
    });
  }
}

export type ResolveHandler<T> = () => T;

export class Debounce<T> {
  #delay: number;
  #onResolve: ResolveHandler<T>;
  #resolve: ((value: T) => void) | undefined;
  #timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(delay: number, onResolve: ResolveHandler<T>) {
    this.#delay = delay;
    this.#onResolve = onResolve;
  }

  clearTimeout(): void {
    clearTimeout(this.#timeout);
  }

  refreshTimeout(): void {
    this.clearTimeout();

    this.#timeout = setTimeout(() => {
      this.#resolve?.(this.#onResolve());
    }, this.#delay);
  }

  resolveWith(value: T): void {
    this.#resolve?.(value);
  }

  setup(): Promise<T> {
    // TODO use 'Promise.withResolvers()' after dropping support for Node.js 20
    return new Promise<T>((resolve) => {
      this.#resolve = resolve;
    });
  }
}

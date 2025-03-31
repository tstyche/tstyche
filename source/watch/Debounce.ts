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

  cancel(): void {
    clearTimeout(this.#timeout);
  }

  refresh(): void {
    this.cancel();

    this.#timeout = setTimeout(() => {
      this.#resolve?.(this.#onResolve());
    }, this.#delay);
  }

  resolve(value: T): void {
    this.#resolve?.(value);
  }

  schedule(): Promise<T> {
    return new Promise<T>((resolve) => {
      this.#resolve = resolve;
    });
  }
}

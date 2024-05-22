export class Timeout {
  #timeout: ReturnType<typeof setTimeout> | undefined;

  clear(): void {
    clearTimeout(this.#timeout);
  }

  set<T>(callback: (arg: T) => void | Promise<void>, delay: number, arg: T): void {
    new Promise<T>((resolve) => {
      this.#timeout = setTimeout(resolve, delay, arg);
    }).then(async (arg: T) => {
      await callback(arg);
    });
  }
}

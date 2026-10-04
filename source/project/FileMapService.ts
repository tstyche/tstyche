export class FileMapService {
  #files: Map<string, string> = new Map();

  add(path: string, text: string): void {
    this.#files.set(path, text);
  }

  get(): Record<string, string> {
    const result = Object.fromEntries(this.#files);
    this.#files.clear();

    return result;
  }

  hasChanged(): boolean {
    return this.#files.size > 0;
  }
}

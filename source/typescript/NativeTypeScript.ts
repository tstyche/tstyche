export class NativeTypeScript {
  version: string;

  constructor(version: string) {
    this.version = version;
  }

  async close() {
    // await this.#cleanup();
  }
}

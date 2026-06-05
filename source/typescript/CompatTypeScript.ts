import type ts from "typescript";

export class CompatTypeScript {
  // TODO make this private after implementing all needed methods
  compiler: typeof ts;
  version: string;

  constructor(compiler: typeof ts, version: string) {
    this.compiler = compiler;
    this.version = version;
  }

  async close() {
    // await this.#cleanup();
  }
}

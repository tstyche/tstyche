import { fileURLToPath } from "node:url";
import { Path } from "#path";

export class TestFile {
  path: string;
  position?: number;

  constructor(identifier: string | URL) {
    this.path = Path.normalizeSlashes(this.#resolvePath(identifier));
  }

  add(options: { position?: number }): this {
    if (options.position != null) {
      this.position = options.position;
    }

    return this;
  }

  #resolvePath(identifier: string | URL) {
    if (typeof identifier === "string" && !identifier.startsWith("file:")) {
      return identifier;
    }

    return fileURLToPath(identifier);
  }
}

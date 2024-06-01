import { fileURLToPath } from "node:url";
import { Path } from "#path";

export class TestFile {
  path: string;
  position: number | undefined;

  constructor(identifier: string | URL, position?: number) {
    this.path = Path.normalizeSlashes(this.#toPath(identifier));
    this.position = position;
  }

  #toPath(identifier: string | URL) {
    if (typeof identifier === "string" && !identifier.startsWith("file:")) {
      return identifier;
    }

    return fileURLToPath(identifier);
  }
}

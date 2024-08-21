import { fileURLToPath } from "node:url";
import { Path } from "#path";

export class TestTask {
  filePath: string;
  position: number | undefined;

  constructor(identifier: string | URL, position?: number) {
    this.filePath = Path.normalizeSlashes(this.#toPath(identifier));
    this.position = position;
  }

  #toPath(identifier: string | URL) {
    if (typeof identifier === "string" && !identifier.startsWith("file:")) {
      return identifier;
    }

    return fileURLToPath(identifier);
  }
}

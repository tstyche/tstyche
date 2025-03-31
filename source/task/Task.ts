import { fileURLToPath } from "node:url";
import { Path } from "#path";

export class Task {
  filePath: string;
  position: number | undefined;

  constructor(filePath: string | URL, position?: number) {
    this.filePath = Path.resolve(this.#toPath(filePath));
    this.position = position;
  }

  #toPath(filePath: string | URL) {
    if (typeof filePath === "string" && !filePath.startsWith("file:")) {
      return filePath;
    }

    return fileURLToPath(filePath);
  }
}

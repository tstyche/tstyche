import { fileURLToPath } from "node:url";
import { Path } from "#path";

export class FileLocation {
  path: string;
  position: number | undefined;

  constructor(file: string | URL, position?: number) {
    this.path = Path.resolve(this.#toPath(file));
    this.position = position;
  }

  #toPath(file: string | URL) {
    if (typeof file === "string" && !file.startsWith("file:")) {
      return file;
    }

    return fileURLToPath(file);
  }
}

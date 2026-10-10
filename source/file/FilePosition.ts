import { fileURLToPath } from "node:url";
import type * as tsAst from "typescript/ast";
import { Path } from "#path";

export class FilePosition {
  path: tsAst.RootedFilePath;
  position: number | undefined;

  constructor(file: string | URL, position?: number) {
    this.path = Path.resolve(this.#toPath(file)) as tsAst.RootedFilePath;
    this.position = position;
  }

  #toPath(file: string | URL) {
    if (typeof file === "string" && !file.startsWith("file:")) {
      return file;
    }

    return fileURLToPath(file);
  }
}

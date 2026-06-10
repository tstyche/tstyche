import { documentURIToFileName } from "@typescript/native-preview/unstable/sync";
import { Path } from "#path";

// TODO rename to 'FilePosition', consider using 'type FileIdentifier = string | { uri: string; }'
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

    return documentURIToFileName(file.toString());
  }
}

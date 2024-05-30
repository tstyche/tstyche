import path from "node:path";

export class Path {
  static normalizeSlashes: (filePath: string) => string;

  static {
    if (path.sep === "/") {
      Path.normalizeSlashes = (filePath) => filePath;
    } else {
      Path.normalizeSlashes = (filePath) => filePath.replace(/\\/g, "/");
    }
  }

  static dirname(filePath: string): string {
    return Path.normalizeSlashes(path.dirname(filePath));
  }

  static join(...filePaths: Array<string>): string {
    return Path.normalizeSlashes(path.join(...filePaths));
  }

  static relative(from: string, to: string): string {
    let relativePath = path.relative(from, to);

    if (!relativePath.startsWith("./")) {
      relativePath = `./${relativePath}`;
    }

    return Path.normalizeSlashes(relativePath);
  }

  static resolve(...filePaths: Array<string>): string {
    return Path.normalizeSlashes(path.resolve(...filePaths));
  }
}

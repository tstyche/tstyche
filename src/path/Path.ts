import path from "node:path";

export class Path {
  static basename(filePath: string): string {
    return Path.normalizePath(path.basename(filePath));
  }

  static dirname(filePath: string): string {
    return Path.normalizePath(path.dirname(filePath));
  }

  static join(...filePaths: Array<string>): string {
    return Path.normalizePath(path.join(...filePaths));
  }

  static normalizePath(filePath: string): string {
    if (path.sep === "/") {
      return filePath;
    }

    return filePath.replaceAll("\\", "/");
  }

  static relative(from: string, to: string): string {
    let relativePath = path.relative(from, to);

    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }

    return Path.normalizePath(relativePath);
  }

  static resolve(...filePaths: Array<string>): string {
    return Path.normalizePath(path.resolve(...filePaths));
  }
}

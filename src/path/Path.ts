import path from "node:path";

export class Path {
  static basename(filePath: string): string {
    return Path.normalize(path.basename(filePath));
  }

  static dirname(filePath: string): string {
    return Path.normalize(path.dirname(filePath));
  }

  static join(...filePaths: Array<string>): string {
    return Path.normalize(path.join(...filePaths));
  }

  static normalize(filePath: string): string {
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

    return Path.normalize(relativePath);
  }

  static resolve(...filePaths: Array<string>): string {
    return Path.normalize(path.resolve(...filePaths));
  }
}

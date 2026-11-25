import { Braces } from "./Braces.js";

export class Glob {
  // matches a single wildcard, or a run of literal text between wildcards
  static #tokenRegex = /[*?]|[^*?]+/g;

  // all wildcards must not match path segments that start with a dot '[^./]'
  // as well as the 'node_modules' directories '(?!(node_modules)(\\/|$))'
  static #parse(pattern: string, usageTarget: "directories" | "files") {
    const segments = pattern.split("/");

    let resultPattern = "\\.";
    let optionalSegmentCount = 0;

    for (const segment of segments) {
      if (segment === ".") {
        continue;
      }

      if (segment === "**") {
        resultPattern += "(\\/(?!(node_modules)(\\/|$))[^./][^/]*)*?";
        continue;
      }

      if (usageTarget === "directories") {
        resultPattern += "(";
        optionalSegmentCount++;
      }

      resultPattern += "\\/";

      // no need to exclude 'node_modules' when a segment has no wildcards
      if (segment.includes("*") || segment.includes("?")) {
        resultPattern += "(?!(node_modules)(\\/|$))";
      }

      // a leading wildcard must not allow a match to start with a dot
      if (segment.startsWith("*") || segment.startsWith("?")) {
        resultPattern += "(?!\\.)";
      }

      resultPattern += segment.replace(Glob.#tokenRegex, Glob.#replaceToken);
    }

    resultPattern += ")?".repeat(optionalSegmentCount);

    return resultPattern;
  }

  static #replaceToken(this: void, token: string) {
    switch (token) {
      case "*":
        return "[^/]*";

      case "?":
        return "[^/]";

      default:
        return RegExp.escape(token);
    }
  }

  static toRegex(patterns: Array<string>, target: "directories" | "files"): RegExp {
    const patternText = patterns
      .flatMap((pattern) => Braces.expand(pattern))
      .map((pattern) => `(${Glob.#parse(pattern, target)})`)
      .join("|");

    return new RegExp(`^(${patternText})$`);
  }
}

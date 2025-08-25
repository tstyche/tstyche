import { Braces } from "./Braces.js";

export class Glob {
  // TODO use 'RegExp.escape()' after dropping support for Node.js 22
  // escaping any non-word and non-whitespace character sounds inefficient, but this is future proof
  static #reservedCharacterRegex = /[^\w\s/]/g;

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

      const segmentPattern = segment.replace(Glob.#reservedCharacterRegex, Glob.#replaceReservedCharacter);

      // no need to exclude 'node_modules' when a segment has no wildcards
      if (segmentPattern !== segment) {
        resultPattern += "(?!(node_modules)(\\/|$))";
      }

      resultPattern += segmentPattern;
    }

    resultPattern += ")?".repeat(optionalSegmentCount);

    return resultPattern;
  }

  static #replaceReservedCharacter(this: void, match: string, offset: number) {
    switch (match) {
      case "*":
        return offset === 0 ? "([^./][^/]*)?" : "([^/]*)?";

      case "?":
        return offset === 0 ? "[^./]" : "[^/]";

      default:
        return `\\${match}`;
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

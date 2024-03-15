export class RegexWorker {
  // escaping any non-word and non-whitespace character sounds inefficient, but this is future proof
  #reservedCharacterPattern = /[^\w\s/]/g;

  // all wildcards must not match path segments that start with a dot '[^./]'
  // as well as the 'node_modules' directories '(?!(node_modules)(\\/|$))'
  #parseGlob(pattern: string, usageTarget: "directories" | "files") {
    const segments = pattern.split("/");

    let resultPattern = "\\.";
    let optionalSegmentCount = 0;

    for (const segment of segments) {
      if (segment === "**") {
        resultPattern += "(\\/(?!(node_modules)(\\/|$))[^./][^/]*)*?";
        continue;
      }

      if (usageTarget === "directories") {
        resultPattern += "(";
        optionalSegmentCount++;
      }

      resultPattern += `\\/`;

      const segmentPattern = segment.replace(this.#reservedCharacterPattern, this.#replaceReservedCharacter);

      // no need to exclude 'node_modules' when a segment has no wildcards
      if (segmentPattern !== segment) {
        resultPattern += "(?!(node_modules)(\\/|$))";
      }

      resultPattern += segmentPattern;
    }

    resultPattern += ")?".repeat(optionalSegmentCount);

    return resultPattern;
  }

  parseGlobs(patterns: Array<string>, usageTarget: "directories" | "files"): RegExp {
    const patternText = patterns.map((pattern) => `(${this.#parseGlob(pattern, usageTarget)})`).join("|");

    return new RegExp(`^(${patternText})$`);
  }

  #replaceReservedCharacter(this: void, match: string, offset: number) {
    switch (match) {
      case "*":
        return (offset === 0) ? "([^./][^/]*)?" : "([^/]*)?";

      case "?":
        return (offset === 0) ? "[^./]" : "[^/]";

      default:
        return `\\${match}`;
    }
  }
}

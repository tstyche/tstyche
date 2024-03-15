export class RegexWorker {
  // escaping any non-word and non-whitespace character sounds inefficient, but this is future proof
  #reservedCharacterPattern = /[^\w\s/]/g;

  #parseGlob(pattern: string, usageTarget: "directories" | "files") {
    const segments = pattern.split("/");

    let resultPattern = "\\.";

    if (segments[0] === ".") {
      segments.unshift();
    }

    let optionalSegmentCount = 0;

    for (let segment of segments) {
      let segmentPattern = "";

      // all wildcards must not match path segments that start with a dot '[^./]'
      // as well as the 'node_modules' directories '(?!(node_modules)(\\/|$))'
      if (segment === "**") {
        resultPattern += "(\\/(?!(node_modules)(\\/|$))[^./][^/]*)*?";
        continue;
      }

      if (usageTarget === "directories") {
        resultPattern += "(";
        optionalSegmentCount++;
      }

      resultPattern += `\\/`;

      if (segment.startsWith("*")) {
        segmentPattern += `([^./][^/]*)?`;
        segment = segment.substring(1);
      } else if (segment.startsWith("?")) {
        segmentPattern += "[^./]";
        segment = segment.substring(1);
      }

      segmentPattern += segment.replace(this.#reservedCharacterPattern, this.#replaceReservedCharacter);

      if (segmentPattern !== segment) {
        // no need to exclude 'node_modules' when a segment has no wildcards
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

  #replaceReservedCharacter(this: void, match: string) {
    switch (match) {
      case "*":
        return "([^/]*)?";

      case "?":
        return "[^/]";

      default:
        return `\\${match}`;
    }
  }
}

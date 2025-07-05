export class GlobService {
  // escaping any non-word and non-whitespace character sounds inefficient, but this is future proof
  static #reservedCharacterRegex = /[^\w\s/]/g;

  static #expandBraces(text: string, start?: number) {
    start = start ?? text.indexOf("{");

    if (start !== -1) {
      let position = start + 1;

      while (position < text.length) {
        switch (text[position]) {
          case "}":
            text = `${text.slice(0, start - 1)}(${text.slice(start + 1, position - 1).replaceAll("\\,", "|")})${text.slice(position + 1)}`;
            break;

          case "{":
            text = GlobService.#expandBraces(text, position);
            break;
        }

        position++;
      }
    }

    return text;
  }

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

      const segmentPattern = segment.replace(
        GlobService.#reservedCharacterRegex,
        GlobService.#replaceReservedCharacter,
      );

      // no need to exclude 'node_modules' when a segment has no wildcards
      if (segmentPattern !== segment) {
        resultPattern += "(?!(node_modules)(\\/|$))";
      }

      resultPattern += segmentPattern;
    }

    resultPattern += ")?".repeat(optionalSegmentCount);

    resultPattern = GlobService.#expandBraces(resultPattern);

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
    const patternText = patterns.map((pattern) => `(${GlobService.#parse(pattern, target)})`).join("|");

    return new RegExp(`^(${patternText})$`);
  }
}

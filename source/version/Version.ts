export class Version {
  static isGreaterThan(source: string, target: string): boolean {
    return !(source === target) && Version.#satisfies(source, target);
  }

  static isRange(query: string) {
    return /^[<>]=?\d\.\d$/.test(query);
  }

  static isSatisfiedWith(source: string, target: string): boolean {
    return source === target || Version.#satisfies(source, target);
  }

  static isVersionTag(target: string): boolean {
    return /^\d+/.test(target);
  }

  static #pick(query: string, list: Array<string>): Array<string> {
    if (!Version.isRange(query)) {
      return [query];
    }

    const targetVersionIndex = list.findIndex((version) => version === query.replace(/^[<>]=?/, ""));

    let matchingVersions: Array<string> = [];

    if (targetVersionIndex !== -1) {
      switch (query.charAt(0)) {
        case ">":
          matchingVersions = list.slice(query.charAt(1) === "=" ? targetVersionIndex : targetVersionIndex + 1);
          break;

        case "<":
          matchingVersions = list.slice(0, query.charAt(1) === "=" ? targetVersionIndex + 1 : targetVersionIndex);
          break;
      }
    }

    return matchingVersions;
  }

  static resolveQueries(queries: Array<string>, minorVersions: Array<string>): Array<string> {
    const exclude: Array<string> = [];
    const include: Array<string> = [];

    for (const query of queries) {
      if (query.startsWith("not")) {
        exclude.push(...Version.#pick(query.slice(4), minorVersions));
      } else {
        include.push(...Version.#pick(query, minorVersions));
      }
    }

    return include.filter((query) => !exclude.includes(query));
  }

  static #satisfies(source: string, target: string): boolean {
    const sourceElements = source.split(/\.|-/);
    const targetElements = target.split(/\.|-/);

    function compare(index = 0): boolean {
      const sourceElement = sourceElements[index] as string;
      const targetElement = targetElements[index] as string;

      if (sourceElement > targetElement) {
        return true;
      }

      if (sourceElement < targetElement) {
        return false;
      }

      if (index === sourceElements.length - 1 || index === targetElements.length - 1) {
        return true;
      }

      return compare(index + 1);
    }

    return compare();
  }
}

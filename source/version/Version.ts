export class Version {
  static slice(list: Array<string>, range: string): Array<string> {
    const targetVersionIndex = list.findIndex((version) => version === range.replace(/^[<>]=?/, ""));

    let matchingVersions: Array<string> = [];

    if (targetVersionIndex !== -1) {
      switch (range.charAt(0)) {
        case ">":
          matchingVersions = list.slice(range.charAt(1) === "=" ? targetVersionIndex : targetVersionIndex + 1);
          break;

        case "<":
          matchingVersions = list.slice(0, range.charAt(1) === "=" ? targetVersionIndex + 1 : targetVersionIndex);
          break;
      }
    }

    return matchingVersions;
  }

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

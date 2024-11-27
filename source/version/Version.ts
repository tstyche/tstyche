export class Version {
  static isGreaterThan(source: string, target: string): boolean {
    return !(source === target) && Version.#satisfies(source, target);
  }

  static isSatisfiedWith(source: string, target: string): boolean {
    return source === target || Version.#satisfies(source, target);
  }

  // TODO rename to 'isVersion()'
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

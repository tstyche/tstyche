export class Version {
  static satisfies(source: string, target: string): boolean {
    const sourceElements = source.split(/\.|-/);
    const targetElements = target.split(/\.|-/);

    function compare(index = 0): boolean {
      const sourceElement = sourceElements[index]!;
      const targetElement = targetElements[index]!;

      if (sourceElement > targetElement) {
        return true;
      }

      if (sourceElement === targetElement) {
        if (index === targetElements.length - 1) {
          return true;
        }

        return compare(index + 1);
      }

      return false;
    }

    return compare();
  }
}

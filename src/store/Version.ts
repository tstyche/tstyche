export class Version {
  static satisfies(source: string, target: string): boolean {
    const sourceVersions = source.split(/\.|-/);
    const targetVersions = target.split(/\.|-/);

    function compare(index = 0): boolean {
      const sourceElement = sourceVersions[index];
      const targetElement = targetVersions[index];

      if (sourceElement == null || targetElement == null) {
        return false;
      }

      if (sourceElement > targetElement) {
        return true;
      }

      if (sourceElement === targetElement) {
        if (index === targetVersions.length - 1) {
          return true;
        }

        return compare(index + 1);
      }

      return false;
    }

    return compare();
  }
}

import { Store } from "#store";

export class Target {
  static #rangeRegex = /^[<>]=?\d\.\d( [<>]=?\d\.\d)?$/;

  static expand(queries: Array<string>): Array<string> {
    const include: Array<string> = [];

    for (const query of queries) {
      if (!Target.isRange(query)) {
        include.push(query);

        continue;
      }

      const comparators = query.split(" ");

      if (Store.manifest != null) {
        let versions = Object.keys(Store.manifest.resolutions).slice(0, -4);

        for (const comparator of comparators) {
          versions = Target.#filter(comparator, versions);
        }

        include.push(...versions);
      }
    }

    return include;
  }

  static #filter(comparator: string, versions: Array<string>): Array<string> {
    const targetVersionIndex = versions.findIndex((version) => version === comparator.replace(/^[<>]=?/, ""));

    if (targetVersionIndex !== -1) {
      switch (comparator.charAt(0)) {
        case ">":
          return versions.slice(comparator.charAt(1) === "=" ? targetVersionIndex : targetVersionIndex + 1);

        case "<":
          return versions.slice(0, comparator.charAt(1) === "=" ? targetVersionIndex + 1 : targetVersionIndex);
      }
    }

    return [];
  }

  static isRange(query: string) {
    return Target.#rangeRegex.test(query);
  }
}

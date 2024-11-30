import { Store } from "#store";
import { Version } from "#version";

export class Target {
  static expand(queries: Array<string>): Array<string> {
    const include: Array<string> = [];

    for (const query of queries) {
      if (Version.isVersionTag(query)) {
        include.push(query);

        continue;
      }

      const comparators = query.split(" ");

      // TODO consider adding 'getMinorVersions()' method to 'manifest'
      let versions = Object.keys(Store.manifest?.resolutions ?? []).slice(0, -4);

      for (const comparator of comparators) {
        versions = Target.#filter(comparator, versions);
      }

      include.push(...versions);
    }

    return include;
  }

  static #filter(comparator: string, versions: Array<string>): Array<string> {
    const targetVersionIndex = versions.findIndex((version) => version === comparator.replace(/^[<>]=?/, ""));

    let matchingVersions: Array<string> = [];

    if (targetVersionIndex !== -1) {
      switch (comparator.charAt(0)) {
        case ">":
          matchingVersions = versions.slice(comparator.charAt(1) === "=" ? targetVersionIndex : targetVersionIndex + 1);
          break;

        case "<":
          matchingVersions = versions.slice(
            0,
            comparator.charAt(1) === "=" ? targetVersionIndex + 1 : targetVersionIndex,
          );
          break;
      }
    }

    return matchingVersions;
  }
}

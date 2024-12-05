import { Store } from "#store";
import { Version } from "#version";

export class Target {
  static #rangeRegex = /^[<>]=?\d\.\d( [<>]=?\d\.\d)?$/;

  static async expand(queries: Array<string>): Promise<Array<string>> {
    const include: Array<string> = [];

    for (const query of queries) {
      if (!Target.isRange(query)) {
        include.push(query);

        continue;
      }

      await Store.open();

      if (Store.manifest != null) {
        let versions = Object.keys(Store.manifest.resolutions).slice(0, -4);

        for (const comparator of query.split(" ")) {
          versions = Target.#filter(comparator, versions);
        }

        include.push(...versions);
      }
    }

    return include;
  }

  static #filter(comparator: string, versions: Array<string>): Array<string> {
    const targetVersion = comparator.replace(/^[<>]=?/, "");

    switch (comparator.charAt(0)) {
      case ">":
        return versions.filter((sourceVersion) =>
          comparator.charAt(1) === "="
            ? Version.isSatisfiedWith(sourceVersion, targetVersion)
            : Version.isGreaterThan(sourceVersion, targetVersion),
        );

      case "<":
        return versions.filter((sourceVersion) =>
          comparator.charAt(1) === "="
            ? Version.isSatisfiedWith(targetVersion, sourceVersion)
            : Version.isGreaterThan(targetVersion, sourceVersion),
        );
    }

    return [];
  }

  static isRange(query: string) {
    return Target.#rangeRegex.test(query);
  }
}

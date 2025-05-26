import { Store } from "#store";
import { Version } from "#version";

export class Target {
  static #rangeRegex = /^[<>]=?\d\.\d( [<>]=?\d\.\d)?$/;

  // TODO must be called form 'Options.resolve()'
  //      - that does not work now, because 'target' is an array,
  //      but it must be a string in semver style: '1.2.7 || >=1.2.9 <2.0.0'
  //      - 'Target.expand()' should be able to know the location
  //      and that will allow reporting empty ranges: "There are no versions matching the range."

  static async expand(queries: Array<string>): Promise<Array<string>> {
    const include: Array<string> = [];

    for (const query of queries) {
      if (!Target.isRange(query)) {
        include.push(query);

        continue;
      }

      await Store.open();

      if (Store.manifest != null) {
        let versions = [...Store.manifest.minorVersions];

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

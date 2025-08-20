import { Store } from "#store";
import { Version } from "#version";

export class Target {
  static #rangeRegex = /^[<>]=?\d\.\d( [<>]=?\d\.\d)?$/;

  static async expand(range: string): Promise<Array<string>> {
    if (Target.isRange(range)) {
      await Store.open();

      if (Store.manifest != null) {
        let versions = [...Store.manifest.minorVersions];

        for (const comparator of range.split(" ")) {
          versions = Target.#filter(comparator.trim(), versions);
        }

        return versions;
      }
    }

    return [range];
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

  static split(range: string) {
    return range.split(/ *\|\| */);
  }
}

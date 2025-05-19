import { Store } from "#store";
import { Version } from "#version";

export class Target {
  static #rangeRegex = /^[<>]=?\d\.\d( [<>]=?\d\.\d)?$/;

  static async expand(queries: Array<string>, options?: { resolve?: boolean }): Promise<Array<string>> {
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

    return options?.resolve
      ? include.map((version) => Store.manifest?.resolve(version)).filter((version) => version != null)
      : include;
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

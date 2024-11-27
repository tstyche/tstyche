export class Target {
  static #filter(query: string, list: Array<string>): Array<string> {
    if (!Target.isRange(query)) {
      return [query];
    }

    const targetVersionIndex = list.findIndex((version) => version === query.replace(/^[<>]=?/, ""));

    let matchingVersions: Array<string> = [];

    if (targetVersionIndex !== -1) {
      switch (query.charAt(0)) {
        case ">":
          matchingVersions = list.slice(query.charAt(1) === "=" ? targetVersionIndex : targetVersionIndex + 1);
          break;

        case "<":
          matchingVersions = list.slice(0, query.charAt(1) === "=" ? targetVersionIndex + 1 : targetVersionIndex);
          break;
      }
    }

    return matchingVersions;
  }

  static isRange(query: string) {
    return /^[<>]=?\d\.\d$/.test(query);
  }

  static resolve(queries: Array<string>, minorVersions: Array<string>): Array<string> {
    const exclude: Array<string> = [];
    const include: Array<string> = [];

    for (const query of queries) {
      if (query.startsWith("not")) {
        exclude.push(...Target.#filter(query.slice(4), minorVersions));
      } else {
        include.push(...Target.#filter(query, minorVersions));
      }
    }

    return include.filter((query) => !exclude.includes(query));
  }
}

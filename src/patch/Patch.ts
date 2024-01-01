import fs from "node:fs";

export class Patch {
  static register(): void {
    const readFileSync = fs.readFileSync;

    fs.readFileSync = new Proxy(fs.readFileSync, {
      apply(target, thisArgument, argumentList: [string]) {
        if (
          argumentList[0].endsWith("typescript/lib/typescript.js") ||
          argumentList[0].endsWith("typescript/lib/tsserverlibrary.js")
        ) {
          return readFileSync(argumentList[0], { encoding: "utf8" }).replace(
            "isTypeAssignableTo,",
            "isTypeAssignableTo, isTypeIdenticalTo, isTypeSubtypeOf,",
          );
        }

        return Reflect.apply(target, thisArgument, argumentList);
      },
    });
  }
}

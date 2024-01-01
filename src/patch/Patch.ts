import fs from "node:fs";
import path from "node:path";

export class Patch {
  static register(): void {
    const readFileSync = fs.readFileSync;

    fs.readFileSync = new Proxy(fs.readFileSync, {
      apply(target, thisArgument, argumentList: [string]) {
        if (
          argumentList[0].endsWith(path.join("typescript", "lib", "typescript.js")) ||
          argumentList[0].endsWith(path.join("typescript", "lib", "tsserverlibrary.js"))
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

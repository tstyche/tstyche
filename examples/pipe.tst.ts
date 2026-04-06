import { test } from "tstyche";

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

test("pick", () => {
  pipe({ valid: true }, pick("valid"));
  // @ts-expect-error Argument of type '"invalid"' is not assignable to parameter of type '"valid"'
  pipe({ valid: true }, pick("invalid"));
});

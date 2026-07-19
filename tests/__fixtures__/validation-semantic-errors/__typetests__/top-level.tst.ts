import type ts from "@typescript/typescript6";
import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});

const a: number = "nine";

if (a > 9) {
  //
}

test(284963, () => {
  expect<string>().type.toBe<string>();
});

declare function silence(d: ts.DiagnosticWithLocation): void;

silence({} as ts.Diagnostic);

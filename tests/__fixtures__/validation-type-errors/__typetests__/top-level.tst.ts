import { expect, test } from "tstyche";
import type ts from "typescript";

test("is string?", () => {
  expect<string>().type.toBeString();
});

const a: number = "nine";

if (a > 9) {
  //
}

test(284963, () => {
  expect<string>().type.toBeString();
});

declare function silence(d: ts.DiagnosticWithLocation): void;

silence({} as ts.Diagnostic);

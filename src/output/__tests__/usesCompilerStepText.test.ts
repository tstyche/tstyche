import path from "node:path";
import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { Scribbler } from "#scribbler";
import { usesCompilerStepText } from "../usesCompilerStepText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const sampleTsconfigFilePath = path.resolve("path", "to", "tsconfig.json");

const scribbler = new Scribbler();

describe("usesCompilerStepText", () => {
  test("formats uses compiler step text", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath));

    expect(text).toMatchInlineSnapshot(`
"<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>

"
`);
  });

  test("formats uses compiler step text with empty line prepended", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath, { prependEmptyLine: true }));

    expect(text).toMatchInlineSnapshot(`
"
<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>

"
`);
  });

  test("formats uses compiler step text without TSConfig path", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", undefined));

    expect(text).toMatchInlineSnapshot(`
"<blue>uses</> TypeScript 1.2.3

"
`);
  });
});

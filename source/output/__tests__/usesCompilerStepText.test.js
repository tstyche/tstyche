import path from "node:path";
import { assert, describe, test } from "poku";
import prettyAnsi from "pretty-ansi";
import { Scribbler, usesCompilerStepText } from "tstyche/tstyche";

const sampleTsconfigFilePath = path.resolve("path", "to", "tsconfig.json");

const scribbler = new Scribbler();

describe("usesCompilerStepText", () => {
  test("formats uses compiler step text", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>", "", ""].join("\n"),
    );
  });

  test("formats uses compiler step text with empty line prepended", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath, { prependEmptyLine: true }));

    assert.strictEqual(
      prettyAnsi(text),
      ["", "<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>", "", ""].join("\n"),
    );
  });

  test("formats uses compiler step text without TSConfig path", () => {
    const text = scribbler.render(usesCompilerStepText("1.2.3", undefined));

    assert.strictEqual(prettyAnsi(text), ["<blue>uses</> TypeScript 1.2.3", "", ""].join("\n"));
  });
});

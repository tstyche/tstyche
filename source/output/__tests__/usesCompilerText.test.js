import path from "node:path";
import { assert, describe, test } from "poku";
import prettyAnsi from "pretty-ansi";
import { Scribbler, usesCompilerText } from "tstyche/tstyche";

const sampleProjectConfigFilePath = path.resolve("path", "to", "tsconfig.json");

const scribbler = new Scribbler();

describe("usesCompilerText", () => {
  test("formats uses compiler text", () => {
    const text = scribbler.render(usesCompilerText("5.3.4", sampleProjectConfigFilePath));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 5.3.4<gray> with ./path/to/tsconfig.json</>", "", ""].join("\n"),
    );
  });

  test("formats uses compiler text with empty line prepended", () => {
    const text = scribbler.render(usesCompilerText("5.3.4", sampleProjectConfigFilePath, { prependEmptyLine: true }));

    assert.strictEqual(
      prettyAnsi(text),
      ["", "<blue>uses</> TypeScript 5.3.4<gray> with ./path/to/tsconfig.json</>", "", ""].join("\n"),
    );
  });

  test("formats uses compiler text without project config file path", () => {
    const text = scribbler.render(usesCompilerText("5.3.4", undefined));

    assert.strictEqual(prettyAnsi(text), ["<blue>uses</> TypeScript 5.3.4", "", ""].join("\n"));
  });
});

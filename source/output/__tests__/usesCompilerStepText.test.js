import { strict as assert } from "node:assert";
import path from "node:path";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Scribbler, usesCompilerStepText } from "tstyche/tstyche";

const sampleTsconfigFilePath = path.resolve("path", "to", "tsconfig.json");

const scribbler = new Scribbler();

describe("usesCompilerStepText", function() {
  test("formats uses compiler step text", function() {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath));

    assert.equal(
      prettyAnsi(text),
      [
        "<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>",
        "",
        "",
      ].join("\n"),
    );
  });

  test("formats uses compiler step text with empty line prepended", function() {
    const text = scribbler.render(usesCompilerStepText("1.2.3", sampleTsconfigFilePath, { prependEmptyLine: true }));

    assert.equal(
      prettyAnsi(text),
      [
        "",
        "<blue>uses</> TypeScript 1.2.3<gray> with ./path/to/tsconfig.json</>",
        "",
        "",
      ].join("\n"),
    );
  });

  test("formats uses compiler step text without TSConfig path", function() {
    const text = scribbler.render(usesCompilerStepText("1.2.3", undefined));

    assert.equal(
      prettyAnsi(text),
      [
        "<blue>uses</> TypeScript 1.2.3",
        "",
        "",
      ].join("\n"),
    );
  });
});

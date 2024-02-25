import assert from "node:assert/strict";
import { URL } from "node:url";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { fileStatusText, ResultStatus, Scribbler } from "tstyche/tstyche";

const sampleTestFile = new URL("../../../path/to/sample.test.ts", import.meta.url);

const scribbler = new Scribbler();

describe("fileStatusText", () => {
  test("formats failing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Failed, sampleTestFile));

    assert.equal(
      prettyAnsi(text),
      [
        "<red>fail</> <gray>./path/to/</>sample.test.ts",
        "",
      ].join("\n"),
    );
  });

  test("formats passing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Passed, sampleTestFile));

    assert.equal(
      prettyAnsi(text),
      [
        "<green>pass</> <gray>./path/to/</>sample.test.ts",
        "",
      ].join("\n"),
    );
  });

  test("formats running file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Runs, sampleTestFile));

    assert.equal(
      prettyAnsi(text),
      [
        "<yellow>runs</> <gray>./path/to/</>sample.test.ts",
        "",
      ].join("\n"),
    );
  });
});

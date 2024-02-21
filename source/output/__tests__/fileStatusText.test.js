import { URL } from "node:url";
import { expect } from "chai";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { fileStatusText, ResultStatus, Scribbler } from "tstyche/tstyche";

const sampleTestFile = new URL("../../../path/to/sample.test.ts", import.meta.url);

const scribbler = new Scribbler();

describe("fileStatusText", () => {
  test("formats failing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Failed, sampleTestFile));

    expect(prettyAnsi(text)).to.equal([
      "<red>fail</> <gray>./path/to/</>sample.test.ts",
      "",
    ].join("\n"));
  });

  test("formats passing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Passed, sampleTestFile));

    expect(prettyAnsi(text)).to.equal([
      "<green>pass</> <gray>./path/to/</>sample.test.ts",
      "",
    ].join("\n"));
  });

  test("formats running file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Runs, sampleTestFile));

    expect(prettyAnsi(text)).to.equal([
      "<yellow>runs</> <gray>./path/to/</>sample.test.ts",
      "",
    ].join("\n"));
  });
});

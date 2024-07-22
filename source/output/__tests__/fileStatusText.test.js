import { assert, describe, test } from "poku";
import prettyAnsi from "pretty-ansi";
import { ResultStatus, Scribbler, TestFile, fileStatusText } from "tstyche/tstyche";

const sampleTestFileUrl = new URL("../../../path/to/sample.test.ts", import.meta.url);
const sampleTestFile = new TestFile(sampleTestFileUrl);

const scribbler = new Scribbler();

describe("fileStatusText", () => {
  test("formats failing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Failed, sampleTestFile));

    assert.strictEqual(prettyAnsi(text), ["<red>fail</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  test("formats passing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Passed, sampleTestFile));

    assert.strictEqual(prettyAnsi(text), ["<green>pass</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  test("formats running file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Runs, sampleTestFile));

    assert.strictEqual(prettyAnsi(text), ["<yellow>runs</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });
});

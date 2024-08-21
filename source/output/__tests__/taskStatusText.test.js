import { assert, describe, test } from "poku";
import prettyAnsi from "pretty-ansi";
import { ResultStatus, Scribbler, TestTask, taskStatusText } from "tstyche/tstyche";

const sampleTestFileUrl = new URL("../../../path/to/sample.test.ts", import.meta.url);
const sampleTask = new TestTask(sampleTestFileUrl);

const scribbler = new Scribbler();

describe("taskStatusText", () => {
  test("formats failing task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Failed, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<red>fail</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  test("formats passing task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Passed, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<green>pass</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  test("formats running task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Runs, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<yellow>runs</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });
});

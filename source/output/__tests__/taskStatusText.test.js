import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { ResultStatus, Scribbler, Task, taskStatusText } from "tstyche/tstyche";

const sampleTestFileUrl = new URL("../../../path/to/sample.test.ts", import.meta.url);
const sampleTask = new Task(sampleTestFileUrl);

const scribbler = new Scribbler();

test("taskStatusText", async (t) => {
  await t.test("formats failing task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Failed, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<red>fail</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  await t.test("formats passing task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Passed, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<green>pass</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  await t.test("formats running task status text", () => {
    const text = scribbler.render(taskStatusText(ResultStatus.Runs, sampleTask));

    assert.strictEqual(prettyAnsi(text), ["<yellow>runs</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });
});

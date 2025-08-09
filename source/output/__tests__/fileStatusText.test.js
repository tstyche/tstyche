import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { FileLocation, fileStatusText, ResultStatus, Scribbler } from "tstyche/tstyche";

const sampleFileUrl = new URL("../../../path/to/sample.test.ts", import.meta.url);
const sampleFile = new FileLocation(sampleFileUrl);

const scribbler = new Scribbler();

test("fileStatusText", async (t) => {
  await t.test("formats failing task status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Failed, sampleFile));

    assert.strictEqual(prettyAnsi(text), ["<red>fail</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  await t.test("formats passing task status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Passed, sampleFile));

    assert.strictEqual(prettyAnsi(text), ["<green>pass</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });

  await t.test("formats running task status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Runs, sampleFile));

    assert.strictEqual(prettyAnsi(text), ["<yellow>runs</> <gray>./path/to/</>sample.test.ts", ""].join("\n"));
  });
});

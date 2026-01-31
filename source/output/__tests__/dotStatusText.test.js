import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { dotStatusText, ResultStatus, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("dotStatusText", async (t) => {
  await t.test("formats passing dot status text", () => {
    const text = scribbler.render(dotStatusText(ResultStatus.Passed));

    assert.strictEqual(prettyAnsi(text), ["·"].join("\n"));
  });

  await t.test("formats failing dot status text", () => {
    const text = scribbler.render(dotStatusText(ResultStatus.Failed));

    assert.strictEqual(prettyAnsi(text), ["<red>×</>"].join("\n"));
  });
});

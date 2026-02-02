import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { dotText, ResultStatus, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("dotText", async (t) => {
  await t.test("formats passing dot text", () => {
    const text = scribbler.render(dotText(ResultStatus.Passed));

    assert.strictEqual(prettyAnsi(text), "·");
  });

  await t.test("formats failing dot text", () => {
    const text = scribbler.render(dotText(ResultStatus.Failed));

    assert.strictEqual(prettyAnsi(text), "<red>×</>");
  });
});

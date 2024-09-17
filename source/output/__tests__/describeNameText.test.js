import assert from "node:assert";
import test from "node:test";
import { Scribbler, describeNameText } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("describeNameText", async (t) => {
  await t.test("describe name text", () => {
    const text = scribbler.render(describeNameText("sample describe name"));

    assert.strictEqual(text, ["  sample describe name", ""].join("\n"));
  });

  await t.test("describe name text with indent", () => {
    const text = scribbler.render(describeNameText("sample describe name", 2));

    assert.strictEqual(text, ["      sample describe name", ""].join("\n"));
  });
});

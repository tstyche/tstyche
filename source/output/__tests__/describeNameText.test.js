import assert from "node:assert";
import { describe, test } from "node:test";
import { Scribbler, describeNameText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("describeNameText", () => {
  test("describe name text", () => {
    const text = scribbler.render(describeNameText("sample describe name"));

    assert.strictEqual(text, ["  sample describe name", ""].join("\n"));
  });

  test("describe name text with indent", () => {
    const text = scribbler.render(describeNameText("sample describe name", 2));

    assert.strictEqual(text, ["      sample describe name", ""].join("\n"));
  });
});

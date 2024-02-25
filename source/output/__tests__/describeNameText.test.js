import { strict as assert } from "node:assert";
import { describe, test } from "mocha";
import { describeNameText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("describeNameText", () => {
  test("describe name text", () => {
    const text = scribbler.render(describeNameText("sample describe name"));

    assert.equal(
      text,
      [
        "  sample describe name",
        "",
      ].join("\n"),
    );
  });

  test("describe name text with indent", () => {
    const text = scribbler.render(describeNameText("sample describe name", 2));

    assert.equal(
      text,
      [
        "      sample describe name",
        "",
      ].join("\n"),
    );
  });
});

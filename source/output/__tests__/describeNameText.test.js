import { expect } from "chai";
import { describe, test } from "mocha";
import { describeNameText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("describeNameText", () => {
  test("describe name text", () => {
    const text = scribbler.render(describeNameText("sample describe name"));

    expect(text).to.equal([
      "  sample describe name",
      "",
    ].join("\n"));
  });

  test("describe name text with indent", () => {
    const text = scribbler.render(describeNameText("sample describe name", 2));

    expect(text).to.equal([
      "      sample describe name",
      "",
    ].join("\n"));
  });
});

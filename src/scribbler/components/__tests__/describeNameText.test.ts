import { describe, expect, test } from "@jest/globals";
import { Scribbler } from "../../Scribbler.js";
import { describeNameText } from "../describeNameText.js";

const scribbler = new Scribbler();

describe("describeNameText", () => {
  test("describe name text", () => {
    const text = scribbler.render(describeNameText("sample describe name"));

    expect(text).toMatchInlineSnapshot(`
      "  sample describe name
      "
    `);
  });

  test("describe name text with indent", () => {
    const text = scribbler.render(describeNameText("sample describe name", 2));

    expect(text).toMatchInlineSnapshot(`
      "      sample describe name
      "
    `);
  });
});

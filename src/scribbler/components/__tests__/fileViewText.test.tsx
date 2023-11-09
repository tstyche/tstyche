import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { Scribbler } from "../../Scribbler.js";
import { Line } from "../Line.js";

afterEach(() => {
  jest.resetModules();
});

const scribbler = new Scribbler();

describe("fileViewText", () => {
  test("formats file view text", async () => {
    const { fileViewText } = await import("../fileViewText.js");

    const text = scribbler.render(
      fileViewText([<Line>Sample element one</Line>, <Line>Sample element two</Line>], false),
    );

    expect(text).toMatchInlineSnapshot(`
      "Sample element one
      Sample element two
      "
    `);
  });

  test("formats file view text with empty line appended", async () => {
    const { fileViewText } = await import("../fileViewText.js");

    const text = scribbler.render(
      fileViewText([<Line>Sample element one</Line>, <Line>Sample element two</Line>], true),
    );

    expect(text).toMatchInlineSnapshot(`
      "Sample element one
      Sample element two

      "
    `);
  });

  test("formats empty file view text", async () => {
    const { fileViewText } = await import("../fileViewText.js");

    const text = scribbler.render(fileViewText([], false));

    expect(text).toMatchInlineSnapshot(`""`);
  });

  test("formats empty file view text with empty line appended", async () => {
    const { fileViewText } = await import("../fileViewText.js");

    const text = scribbler.render(fileViewText([], true));

    expect(text).toMatchInlineSnapshot(`
      "
      "
    `);
  });
});

import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { Color } from "../enums.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const scribbler = new Scribbler();

describe("Line", () => {
  test("renders text", () => {
    const text = scribbler.render(<Line>Sample text</Line>);

    expect(text).toBe("Sample text\n");
  });

  test("renders text with indent", () => {
    const text = scribbler.render(<Line indent={2}>Sample text</Line>);

    expect(text).toBe("    Sample text\n");
  });

  test("renders text with color", () => {
    const text = scribbler.render(<Line color={Color.Green}>Sample text</Line>);

    expect(text).toMatchInlineSnapshot(`
"<green>Sample text</>
"
`);
  });

  test("renders text with all attributes", () => {
    const text = scribbler.render(
      <Line color={Color.Red} indent={2}>
        Sample text
      </Line>,
    );

    expect(text).toMatchInlineSnapshot(`
"    <red>Sample text</>
"
`);
  });
});

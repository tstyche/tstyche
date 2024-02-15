import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { Color } from "../enums.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const scribbler = new Scribbler();

describe("Text", () => {
  test("renders text", () => {
    const text = scribbler.render(<Text>Sample text</Text>);

    expect(text).toBe("Sample text");
  });

  test("renders text with indent", () => {
    const text = scribbler.render(<Text indent={2}>Sample text</Text>);

    expect(text).toBe("    Sample text");
  });

  test("renders text with color", () => {
    const text = scribbler.render(<Text color={Color.Green}>Sample text</Text>);

    expect(text).toMatchInlineSnapshot(`"<green>Sample text</>"`);
  });

  test("renders text with all attributes", () => {
    const text = scribbler.render(
      <Text color={Color.Red} indent={2}>
        Sample text
      </Text>,
    );

    expect(text).toMatchInlineSnapshot(`"    <red>Sample text</>"`);
  });
});

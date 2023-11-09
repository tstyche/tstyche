import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { Diagnostic } from "#diagnostic";
import { Scribbler } from "../../Scribbler.js";
import { diagnosticText } from "../diagnosticText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const scribbler = new Scribbler();

describe("diagnosticText", () => {
  test("formats diagnostic text", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error("sample text")));

    expect(text).toMatchInlineSnapshot(`
      "<red>Error: </>sample text

      "
    `);
  });

  test("formats diagnostic text with more than two lines", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error(["sample text", "with more than", "two lines"])));

    expect(text).toMatchInlineSnapshot(`
      "<red>Error: </>sample text

      with more than
      two lines

      "
    `);
  });
});

import { assert, describe, test } from "poku";
import prettyAnsi from "pretty-ansi";
import { Diagnostic, Scribbler, diagnosticText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("diagnosticText", () => {
  test("formats diagnostic text", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error("sample text")));

    assert.strictEqual(prettyAnsi(text), ["<red>Error: </>sample text", "", ""].join("\n"));
  });

  test("formats diagnostic text with more than two lines", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error(["sample text", "with more than", "two lines"])));

    assert.strictEqual(
      prettyAnsi(text),
      ["<red>Error: </>sample text", "", "with more than", "two lines", "", ""].join("\n"),
    );
  });
});

import { strict as assert } from "node:assert";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Diagnostic, diagnosticText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("diagnosticText", () => {
  test("formats diagnostic text", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error("sample text")));

    assert.equal(
      prettyAnsi(text),
      [
        "<red>Error: </>sample text",
        "",
        "",
      ].join("\n"),
    );
  });

  test("formats diagnostic text with more than two lines", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error(["sample text", "with more than", "two lines"])));

    assert.equal(
      prettyAnsi(text),
      [
        "<red>Error: </>sample text",
        "",
        "with more than",
        "two lines",
        "",
        "",
      ].join("\n"),
    );
  });
});

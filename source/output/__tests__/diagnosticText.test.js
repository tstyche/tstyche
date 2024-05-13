import { strict as assert } from "node:assert";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Diagnostic, Scribbler, diagnosticText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("diagnosticText", function() {
  test("formats diagnostic text", function() {
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

  test("formats diagnostic text with more than two lines", function() {
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

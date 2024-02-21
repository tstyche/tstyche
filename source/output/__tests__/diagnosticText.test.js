import { expect } from "chai";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Diagnostic, diagnosticText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("diagnosticText", () => {
  test("formats diagnostic text", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error("sample text")));

    expect(prettyAnsi(text)).to.equal([
      "<red>Error: </>sample text",
      "",
      "",
    ].join("\n"));
  });

  test("formats diagnostic text with more than two lines", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error(["sample text", "with more than", "two lines"])));

    expect(prettyAnsi(text)).to.equal([
      "<red>Error: </>sample text",
      "",
      "with more than",
      "two lines",
      "",
      "",
    ].join("\n"));
  });
});

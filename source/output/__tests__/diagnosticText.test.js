import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { Diagnostic, Scribbler, diagnosticText } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("diagnosticText", async (t) => {
  await t.test("formats diagnostic text", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error("sample text")));

    assert.strictEqual(prettyAnsi(text), ["<red>Error: </>sample text", "", ""].join("\n"));
  });

  await t.test("formats diagnostic text with more than two lines", () => {
    const text = scribbler.render(diagnosticText(Diagnostic.error(["sample text", "with more than", "two lines"])));

    assert.strictEqual(
      prettyAnsi(text),
      ["<red>Error: </>sample text", "", "with more than", "two lines", "", ""].join("\n"),
    );
  });
});

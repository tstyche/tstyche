import assert from "node:assert";
import { describe, test } from "node:test";
import prettyAnsi from "pretty-ansi";
import { Scribbler, addsPackageText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("addsPackageText", () => {
  test("formats adds package text", () => {
    const text = scribbler.render(addsPackageText("5.4.3", "/sample/path/to/typescript@5.4.3"));

    assert.strictEqual(
      prettyAnsi(text),
      ["<gray>adds</> TypeScript 5.4.3<gray> to /sample/path/to/typescript@5.4.3</>", ""].join("\n"),
    );
  });
});

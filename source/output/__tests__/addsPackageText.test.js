import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { addsPackageText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("addsPackageText", async (t) => {
  await t.test("formats adds text", () => {
    const text = scribbler.render(addsPackageText("5.4.3", "/sample/path/to/typescript@5.4.3"));

    assert.strictEqual(
      prettyAnsi(text),
      ["<gray>adds</> TypeScript 5.4.3<gray> to /sample/path/to/typescript@5.4.3</>", ""].join("\n"),
    );
  });

  await t.test("formats adds short text", () => {
    const text = scribbler.render(addsPackageText("5.4.3", "/sample/path/to/typescript@5.4.3", { short: true }));

    assert.strictEqual(prettyAnsi(text), ["<gray>5.4.3</>", ""].join("\n"));
  });
});

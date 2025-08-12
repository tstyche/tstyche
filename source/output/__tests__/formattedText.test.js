import assert from "node:assert";
import test from "node:test";
import { formattedText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("formattedText", async (t) => {
  await t.test("formats string", () => {
    const string = scribbler.render(formattedText("1.2.3"));

    assert.strictEqual(string, ["1.2.3", ""].join("\n"));
  });

  await t.test("formats list", () => {
    const list = scribbler.render(formattedText(["path/to/first.test.ts", "path/to/second.test.ts"]));

    assert.strictEqual(list, ["[", '  "path/to/first.test.ts",', '  "path/to/second.test.ts"', "]", ""].join("\n"));
  });

  await t.test("formats object", () => {
    const record = scribbler.render(formattedText({ k: "keys", a: "all", s: "sorted" }));

    assert.strictEqual(record, ["{", '  "a": "all",', '  "k": "keys",', '  "s": "sorted"', "}", ""].join("\n"));
  });
});

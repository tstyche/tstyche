import { assert, describe, test } from "poku";
import { Scribbler, formattedText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("formattedText", () => {
  test("formats string", () => {
    const string = scribbler.render(formattedText("1.2.3"));

    assert.strictEqual(string, ["1.2.3", ""].join("\n"));
  });

  test("formats list", () => {
    const list = scribbler.render(formattedText(["path/to/first.test.ts", "path/to/second.test.ts"]));

    assert.strictEqual(list, ["[", '  "path/to/first.test.ts",', '  "path/to/second.test.ts"', "]", ""].join("\n"));
  });

  test("formats object", () => {
    const record = scribbler.render(formattedText({ k: "keys", a: "all", s: "sorted" }));

    assert.strictEqual(record, ["{", '  "a": "all",', '  "k": "keys",', '  "s": "sorted"', "}", ""].join("\n"));
  });
});

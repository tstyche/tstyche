import { strict as assert } from "node:assert";
import { describe, test } from "mocha";
import { formattedText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("formattedText", () => {
  test("formats string", () => {
    const string = scribbler.render(formattedText("1.2.3"));

    assert.equal(
      string,
      [
        "1.2.3",
        "",
      ].join("\n"),
    );
  });

  test("formats list", () => {
    const list = scribbler.render(formattedText(["path/to/first.test.ts", "path/to/second.test.ts"]));

    assert.equal(
      list,
      [
        "[",
        '  "path/to/first.test.ts",',
        '  "path/to/second.test.ts"',
        "]",
        "",
      ].join("\n"),
    );
  });

  test("formats object", () => {
    // eslint-disable-next-line sort-keys -- testing purpose
    const record = scribbler.render(formattedText({ k: "keys", a: "all", s: "sorted" }));

    assert.equal(
      record,
      [
        "{",
        '  "a": "all",',
        '  "k": "keys",',
        '  "s": "sorted"',
        "}",
        "",
      ].join("\n"),
    );
  });
});

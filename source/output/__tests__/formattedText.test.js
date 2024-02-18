import { expect } from "chai";
import { describe, test } from "mocha";
import { formattedText, Scribbler } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("formattedText", () => {
  test("formats string", () => {
    const string = scribbler.render(formattedText("1.2.3"));

    expect(string).to.equal([
      "1.2.3",
      "",
    ].join("\n"));
  });

  test("formats list", () => {
    const list = scribbler.render(formattedText(["path/to/first.test.ts", "path/to/second.test.ts"]));

    expect(list).to.equal([
      "[",
      '  "path/to/first.test.ts",',
      '  "path/to/second.test.ts"',
      "]",
      "",
    ].join("\n"));
  });

  test("formats object", () => {
    // eslint-disable-next-line sort-keys -- testing purpose
    const record = scribbler.render(formattedText({ k: "keys", a: "all", s: "sorted" }));

    expect(record).to.equal([
      "{",
      '  "a": "all",',
      '  "k": "keys",',
      '  "s": "sorted"',
      "}",
      "",
    ].join("\n"));
  });
});

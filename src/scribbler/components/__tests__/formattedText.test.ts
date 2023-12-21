import { describe, expect, test } from "@jest/globals";
import { Scribbler } from "../../Scribbler.js";
import { formattedText } from "../formattedText.js";

const scribbler = new Scribbler();

describe("formattedText", () => {
  test("formats string", () => {
    const string = scribbler.render(formattedText("1.2.3"));

    expect(string).toMatchInlineSnapshot(`
      "1.2.3
      "
    `);
  });

  test("formats list", () => {
    const list = scribbler.render(formattedText(["path/to/first.test.ts", "path/to/second.test.ts"]));

    expect(list).toMatchInlineSnapshot(`
      "[
        "path/to/first.test.ts",
        "path/to/second.test.ts"
      ]
      "
    `);
  });

  test("formats object", () => {
    // eslint-disable-next-line sort-keys -- testing purpose
    const record = scribbler.render(formattedText({ k: "keys", a: "all", s: "sorted" }));

    expect(record).toMatchInlineSnapshot(`
      "{
        "a": "all",
        "k": "keys",
        "s": "sorted"
      }
      "
    `);
  });
});

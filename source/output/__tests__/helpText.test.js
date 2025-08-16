import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { helpText, OptionBrand, Scribbler } from "tstyche/tstyche";

/**
 * @type {Map<string, import("tstyche/tstyche").OptionDefinition>}
 */
const sampleCommandLineOptionDefinitions = new Map([
  [
    "sampleString",
    {
      brand: OptionBrand.String,
      description: "A sample option of string type.",
      group: 2,
      name: "sampleString",
    },
  ],

  [
    "sampleNumber",
    {
      brand: OptionBrand.Number,
      description: "A sample option of number type.",
      group: 2,
      name: "sampleNumber",
    },
  ],

  [
    "sampleBoolean",
    {
      brand: OptionBrand.Boolean,
      description: "A sample option of boolean type.",
      group: 2,
      name: "sampleBoolean",
    },
  ],

  [
    "sampleTrue",
    {
      brand: OptionBrand.BareTrue,
      description: "A sample option of true type.",
      group: 2,
      name: "sampleTrue",
    },
  ],

  [
    "sampleListOfStrings",
    {
      brand: OptionBrand.List,
      description: "A sample option of list of strings type.",
      group: 2,
      items: {
        brand: OptionBrand.String,
        name: "sampleListOfString",
      },
      name: "sampleListOfString",
    },
  ],
]);

const sampleVersion = "1.2.3";

const scribbler = new Scribbler();

test("helpText", async (t) => {
  await t.test("formats help text", () => {
    const text = scribbler.render(helpText(sampleCommandLineOptionDefinitions, sampleVersion));

    assert.strictEqual(
      prettyAnsi(text),
      [
        "The TSTyche Type Test Runner  <gray>1.2.3</>",
        "",
        "  <blue>tstyche</>",
        "  Run all tests.",
        "",
        "  <blue>tstyche query-params</>",
        "  Only run the matching test file.",
        "",
        "  <blue>tstyche --target '5.3, 5.5.2, >=5.7'</>",
        "  Test against specific versions of TypeScript.",
        "",
        "",
        "Command Line Options",
        "",
        "  <blue>--sampleString</>  <gray>string</>",
        "  A sample option of string type.",
        "",
        "  <blue>--sampleNumber</>  <gray>number</>",
        "  A sample option of number type.",
        "",
        "  <blue>--sampleBoolean</>  <gray>boolean</>",
        "  A sample option of boolean type.",
        "",
        "  <blue>--sampleTrue</>",
        "  A sample option of true type.",
        "",
        "  <blue>--sampleListOfString</>  <gray>list of strings</>",
        "  A sample option of list of strings type.",
        "",
        "",
        "To learn more, visit https://tstyche.org",
        "",
        "",
      ].join("\n"),
    );
  });
});

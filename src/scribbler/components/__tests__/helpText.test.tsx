import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { OptionBrand, type OptionDefinition } from "#config";
import { Scribbler } from "../../Scribbler.js";
import { helpText } from "../helpText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const sampleCommandLineOptionDefinitions = new Map<string, OptionDefinition>([
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

describe("helpText", () => {
  test("formats help text", () => {
    const text = scribbler.render(helpText(sampleCommandLineOptionDefinitions, sampleVersion));

    expect(text).toMatchInlineSnapshot(`
      "The TSTyche Type Test Runner  <gray>1.2.3</>

        <blue>tstyche</>
        Run all tests.

        <blue>tstyche path/to/first.test.ts second</>
        Only run the test files with matching path.

        <blue>tstyche --target 4.7,4.8,latest</>
        Test on all specified versions of TypeScript.


      CLI Options

        <blue>--sampleString</>  <gray>string</>
        A sample option of string type.

        <blue>--sampleNumber</>  <gray>number</>
        A sample option of number type.

        <blue>--sampleBoolean</>  <gray>boolean</>
        A sample option of boolean type.

        <blue>--sampleListOfString</>  <gray>list of strings</>
        A sample option of list of strings type.


      To learn more, visit https://tstyche.org

      "
    `);
  });
});

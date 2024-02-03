import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "@jest/globals";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

/**
 * @param {string} filePath
 * @returns {Record<string, unknown>}
 */
function readJsonFile(filePath) {
  const jsonText = readFileSync(new URL(filePath, import.meta.url), { encoding: "utf8" });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(jsonText);
}

/**
 * @param {string} fixtureFileName
 */
function readJsonFixtureFile(fixtureFileName) {
  const fixturePath = path.join("__fixtures__", fixtureFileName);

  return readJsonFile(fixturePath);
}

const configSchema = readJsonFile("../config-schema.json");

describe("config-schema.json", () => {
  describe("valid", () => {
    test.each([
      {
        fixtureFileName: "valid-all-options.json",
        testCase: "all options",
      },
      {
        fixtureFileName: "valid-failFast.json",
        testCase: "'failFast' option",
      },
      {
        fixtureFileName: "valid-rootPath.json",
        testCase: "'rootPath' option",
      },
      {
        fixtureFileName: "valid-target.json",
        testCase: "'target' option",
      },
      {
        fixtureFileName: "valid-testFileMatch.json",
        testCase: "'testFileMatch' option",
      },
    ])("$testCase", ({ fixtureFileName }) => {
      const validate = ajv.compile(configSchema);
      const fixture = readJsonFixtureFile(fixtureFileName);

      expect(validate(fixture)).toBe(true);
    });
  });

  describe("invalid", () => {
    test.each([
      {
        fixtureFileName: "invalid-failFast.json",
        testCase: "value of 'failFast' option must be of type boolean",
      },
      {
        fixtureFileName: "invalid-rootPath.json",
        testCase: "value of 'rootPath' option must be of type string",
      },
      {
        fixtureFileName: "invalid-target-1.json",
        testCase: "item of 'target' option must be of type string",
      },
      {
        fixtureFileName: "invalid-target-2.json",
        testCase: "item of 'target' option must be one of the allowed values",
      },
      {
        fixtureFileName: "invalid-target-3.json",
        testCase: "items of 'target' option must NOT be identical",
      },
      {
        fixtureFileName: "invalid-target-4.json",
        testCase: "value of 'target' option must be of type Array",
      },
      {
        fixtureFileName: "invalid-testFileMatch-1.json",
        testCase: "item of 'testFileMatch' option must be of type string",
      },
      {
        fixtureFileName: "invalid-testFileMatch-2.json",
        testCase: "items of 'testFileMatch' option must NOT be identical",
      },
      {
        fixtureFileName: "invalid-testFileMatch-3.json",
        testCase: "value of 'testFileMatch' option must be of type Array",
      },
    ])("$testCase", ({ fixtureFileName }) => {
      const validate = ajv.compile(configSchema);
      const fixture = readJsonFixtureFile(fixtureFileName);

      expect(validate(fixture)).toBe(false);
      expect(validate.errors).toMatchSnapshot();
    });
  });
});

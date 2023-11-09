import { describe, expect, jest, test } from "@jest/globals";
import { StoreService } from "#store";
import { OptionBrand } from "../OptionBrand.js";
import type { OptionDefinition, OptionValue } from "../OptionDefinitionsMap.js";

const mockedOptionDefinitions = [
  ["mockedBooleanOne", { brand: OptionBrand.Boolean, name: "mockedBooleanOne" }],
  ["mockedBooleanTwo", { brand: OptionBrand.Boolean, name: "mockedBooleanTwo" }],
] as Array<[string, OptionDefinition]>;

jest.unstable_mockModule("../OptionDefinitionsMap.js", () => ({
  OptionDefinitionsMap: {
    for: () => new Map(mockedOptionDefinitions),
  },
}));

const storeService = new StoreService();

const { CommandLineOptionsWorker } = await import("../CommandLineOptionsWorker.js");

describe("CommandLineOptionsWorker", () => {
  describe("collects match strings", () => {
    test.each([
      {
        commandLineArgs: ["path/to/__typetests__/first.test.ts", "path/to/__typetests__/second.test.ts"],
        expected: {
          commandLineOptions: {},
          pathMatch: ["path/to/__typetests__/first.test.ts", "path/to/__typetests__/second.test.ts"],
        },
        testCase: "when called with file names only",
      },
      {
        commandLineArgs: [
          "path/to/__typetests__/first.test.ts",
          "path/to/__typetests__/second.test.ts",
          "--mockedBooleanOne",
        ],
        expected: {
          commandLineOptions: { mockedBooleanOne: true },
          pathMatch: ["path/to/__typetests__/first.test.ts", "path/to/__typetests__/second.test.ts"],
        },
        testCase: "when called with file names followed by boolean option flag",
      },
      {
        commandLineArgs: [
          "path/to/__typetests__/first.test.ts",
          "--mockedBooleanOne",
          "path/to/__typetests__/second.test.ts",
        ],
        expected: {
          commandLineOptions: { mockedBooleanOne: true },
          pathMatch: ["path/to/__typetests__/first.test.ts", "path/to/__typetests__/second.test.ts"],
        },
        testCase: "when called with file names mixed with boolean option flag",
      },
    ])("$testCase", ({ commandLineArgs, expected }) => {
      const commandLineOptions = {};
      const pathMatch: Array<string> = [];

      const onDiagnostics = jest.fn();

      const commandLineWorker = new CommandLineOptionsWorker(
        commandLineOptions as Record<string, OptionValue>,
        pathMatch,
        storeService,
        onDiagnostics,
      );

      commandLineWorker.parse(commandLineArgs);

      expect({ commandLineOptions, pathMatch }).toEqual(expected);
      expect(onDiagnostics).not.toHaveBeenCalled();
    });
  });

  describe("parses boolean option", () => {
    test.each([
      {
        commandLineArgs: ["--mockedBooleanOne"],
        expected: {
          commandLineOptions: { mockedBooleanOne: true },
          pathMatch: [],
        },
        testCase: "when called with bare boolean option flag",
      },
      {
        commandLineArgs: ["--mockedBooleanOne", "true"],
        expected: {
          commandLineOptions: { mockedBooleanOne: true },
          pathMatch: [],
        },
        testCase: "when called with a boolean option flag followed by 'true'",
      },
      {
        commandLineArgs: ["--mockedBooleanOne", "false"],
        expected: {
          commandLineOptions: { mockedBooleanOne: false },
          pathMatch: [],
        },
        testCase: "when called with a boolean option flag followed by 'false'",
      },
      {
        commandLineArgs: ["--mockedBooleanOne", "false", "--mockedBooleanOne", "true"],
        expected: {
          commandLineOptions: { mockedBooleanOne: true },
          pathMatch: [],
        },
        testCase: "when value is overridden by following boolean option flag",
      },
      {
        commandLineArgs: ["--mockedBooleanOne", "--mockedBooleanTwo"],
        expected: {
          commandLineOptions: {
            mockedBooleanOne: true,
            mockedBooleanTwo: true,
          },
          pathMatch: [],
        },
        testCase: "when called with two boolean option flags",
      },
    ])("$testCase", ({ commandLineArgs, expected }) => {
      const commandLineOptions = {};
      const pathMatch: Array<string> = [];

      const onDiagnostics = jest.fn();

      const commandLineWorker = new CommandLineOptionsWorker(
        commandLineOptions as Record<string, OptionValue>,
        pathMatch,
        storeService,
        onDiagnostics,
      );

      commandLineWorker.parse(commandLineArgs);

      expect({ commandLineOptions, pathMatch }).toEqual(expected);
      expect(onDiagnostics).not.toHaveBeenCalled();
    });
  });
});

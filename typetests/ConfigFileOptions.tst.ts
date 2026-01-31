import { describe, expect, test } from "tstyche";
import type { ConfigFileOptions } from "tstyche/tstyche";

describe("ConfigFileOptions", () => {
  test("all options", () => {
    expect<ConfigFileOptions>().type.toBeAssignableFrom({
      checkDeclarationFiles: true,
      checkSuppressedErrors: true,
      failFast: true,
      fixtureFileMatch: ["**/tests/types/fixtures/**/*"],
      quiet: true,
      rejectAnyType: true,
      rejectNeverType: true,
      reporters: ["./tstyche-reporter.js"],
      rootPath: "../",
      target: ["5.0" as const, "5.4" as const, "latest" as const],
      testFileMatch: ["**/tests/types/**/*"],
      tsconfig: "./tsconfig.test.json",
      verbose: true,
    });
  });

  test("all options are optional", () => {
    expect<ConfigFileOptions>().type.toBeAssignableFrom({});
  });

  test("'checkDeclarationFiles' option", () => {
    expect<Pick<ConfigFileOptions, "checkDeclarationFiles">>().type.toBe<{
      checkDeclarationFiles?: boolean;
    }>();
  });

  test("'checkSuppressedErrors' option", () => {
    expect<Pick<ConfigFileOptions, "checkSuppressedErrors">>().type.toBe<{
      checkSuppressedErrors?: boolean;
    }>();
  });

  test("'failFast' option", () => {
    expect<Pick<ConfigFileOptions, "failFast">>().type.toBe<{
      failFast?: boolean;
    }>();
  });

  test("'fixtureFileMatch' option", () => {
    expect<Pick<ConfigFileOptions, "fixtureFileMatch">>().type.toBe<{
      fixtureFileMatch?: Array<string>;
    }>();
  });

  test("'quiet' option", () => {
    expect<Pick<ConfigFileOptions, "quiet">>().type.toBe<{
      quiet?: boolean;
    }>();
  });

  test("'rejectAnyType' option", () => {
    expect<Pick<ConfigFileOptions, "rejectAnyType">>().type.toBe<{
      rejectAnyType?: boolean;
    }>();
  });

  test("'rejectNeverType' option", () => {
    expect<Pick<ConfigFileOptions, "rejectNeverType">>().type.toBe<{
      rejectNeverType?: boolean;
    }>();
  });

  test("'reporters' option", () => {
    expect<Pick<ConfigFileOptions, "reporters">>().type.toBe<{
      reporters?: Array<string>;
    }>();
  });

  test("'rootPath' option", () => {
    expect<Pick<ConfigFileOptions, "rootPath">>().type.toBe<{
      rootPath?: string;
    }>();
  });

  test("'target' option", () => {
    expect<Pick<ConfigFileOptions, "target">>().type.toBe<{
      target?: Array<string>;
    }>();
  });

  test("'testFileMatch' option", () => {
    expect<Pick<ConfigFileOptions, "testFileMatch">>().type.toBe<{
      testFileMatch?: Array<string>;
    }>();
  });

  test("'tsconfig' option", () => {
    expect<Pick<ConfigFileOptions, "tsconfig">>().type.toBe<{
      tsconfig?: string;
    }>();
  });

  test("'verbose' option", () => {
    expect<Pick<ConfigFileOptions, "verbose">>().type.toBe<{
      verbose?: boolean;
    }>();
  });
});

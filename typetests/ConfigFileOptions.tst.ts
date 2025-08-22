import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

describe("ConfigFileOptions", () => {
  test("all options", () => {
    expect<tstyche.ConfigFileOptions>().type.toBeAssignableWith({
      checkDeclarationFiles: true,
      checkSuppressedErrors: true,
      failFast: true,
      fixtureFileMatch: ["**/tests/types/fixtures/**/*"],
      plugins: ["./tstyche-plugin.js"],
      rejectAnyType: true,
      rejectNeverType: true,
      reporters: ["./tstyche-reporter.js"],
      rootPath: "../",
      target: ["5.0" as const, "5.4" as const, "latest" as const],
      testFileMatch: ["**/tests/types/**/*"],
      tsconfig: "./tsconfig.test.json",
    });
  });

  test("all options are optional", () => {
    expect<tstyche.ConfigFileOptions>().type.toBeAssignableWith({});
  });

  test("'checkDeclarationFiles' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "checkDeclarationFiles">>().type.toBe<{
      checkDeclarationFiles?: boolean;
    }>();
  });

  test("'checkSuppressedErrors' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "checkSuppressedErrors">>().type.toBe<{
      checkSuppressedErrors?: boolean;
    }>();
  });

  test("'failFast' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "failFast">>().type.toBe<{
      failFast?: boolean;
    }>();
  });

  test("'fixtureFileMatch' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "fixtureFileMatch">>().type.toBe<{
      fixtureFileMatch?: Array<string>;
    }>();
  });

  test("'plugins' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "plugins">>().type.toBe<{
      plugins?: Array<string>;
    }>();
  });

  test("'rejectAnyType' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "rejectAnyType">>().type.toBe<{
      rejectAnyType?: boolean;
    }>();
  });

  test("'rejectNeverType' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "rejectNeverType">>().type.toBe<{
      rejectNeverType?: boolean;
    }>();
  });

  test("'reporters' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "reporters">>().type.toBe<{
      reporters?: Array<string>;
    }>();
  });

  test("'rootPath' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "rootPath">>().type.toBe<{
      rootPath?: string;
    }>();
  });

  test("'target' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "target">>().type.toBe<{
      target?: Array<string>;
    }>();
  });

  test("'testFileMatch' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "testFileMatch">>().type.toBe<{
      testFileMatch?: Array<string>;
    }>();
  });

  test("'tsconfig' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "tsconfig">>().type.toBe<{
      tsconfig?: string;
    }>();
  });
});

import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

const options: tstyche.ConfigFileOptions = {};

describe("ConfigFileOptions", () => {
  test("all options", () => {
    expect(options).type.toBeAssignableWith({
      failFast: true,
      plugins: ["./tstyche-plugin.js"],
      reporters: ["./tstyche-reporter.js"],
      rootPath: "../",
      target: ["4.9.5" as const, "5.0" as const, "latest" as const],
      testFileMatch: ["**/tests/types/**/*"],
    });
  });

  test("'failFast' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "failFast">>().type.toBe<{
      failFast?: boolean;
    }>();
  });

  test("'plugins' option", () => {
    expect<Pick<tstyche.ConfigFileOptions, "plugins">>().type.toBe<{
      plugins?: Array<string>;
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
});

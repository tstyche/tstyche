import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

const options: tstyche.ConfigFileOptions = {};

describe("ConfigFileOptions", () => {
  test("all options", () => {
    expect(options).type.toBeAssignable({
      allowNoTestFiles: true,
      failFast: true,
      rootPath: "../",
      target: ["4.9.5" as const, "5.0" as const, "latest" as const],
      testFileMatch: ["**/tests/types/**/*"],
    });
  });

  test("'allowNoTestFiles' option", () => {
    expect<tstyche.ConfigFileOptions>().type.toMatch<{
      allowNoTestFiles?: boolean;
    }>();
  });

  test("'failFast' option", () => {
    expect<tstyche.ConfigFileOptions>().type.toMatch<{
      failFast?: boolean;
    }>();
  });

  test("'rootPath' option", () => {
    expect<tstyche.ConfigFileOptions>().type.toMatch<{
      rootPath?: string;
    }>();
  });

  test("'target' option", () => {
    expect<tstyche.ConfigFileOptions>().type.toMatch<{
      target?: Array<string>;
    }>();
  });

  test("'testFileMatch' option", () => {
    expect<tstyche.ConfigFileOptions>().type.toMatch<{
      testFileMatch?: Array<string>;
    }>();
  });
});

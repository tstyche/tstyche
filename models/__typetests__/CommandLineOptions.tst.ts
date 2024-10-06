import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

const options: tstyche.CommandLineOptions = {};

describe("CommandLineOptions", () => {
  test("all options", () => {
    expect(options).type.toBeAssignableWith({
      config: "./config/tstyche.json",
      failFast: true,
      help: true,
      install: true,
      listFiles: true,
      only: "external",
      prune: true,
      showConfig: true,
      skip: "internal",
      target: ["4.9.5" as const, "5.0" as const, "latest" as const],
      update: true,
      version: true,
      watch: true,
    });
  });

  test("'config' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "config">>().type.toBe<{
      config?: string;
    }>();
  });

  test("'failFast' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "failFast">>().type.toBe<{
      failFast?: boolean;
    }>();
  });

  test("'help' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "help">>().type.toBe<{
      help?: boolean;
    }>();
  });

  test("'install' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "install">>().type.toBe<{
      install?: boolean;
    }>();
  });

  test("'listFiles' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "listFiles">>().type.toBe<{
      listFiles?: boolean;
    }>();
  });

  test("'only' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "only">>().type.toBe<{
      only?: string;
    }>();
  });

  test("'prune' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "prune">>().type.toBe<{
      prune?: boolean;
    }>();
  });

  test("'showConfig' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "showConfig">>().type.toBe<{
      showConfig?: boolean;
    }>();
  });

  test("'skip' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "skip">>().type.toBe<{
      skip?: string;
    }>();
  });

  test("'target' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "target">>().type.toBe<{
      target?: Array<string>;
    }>();
  });

  test("'update' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "update">>().type.toBe<{
      update?: boolean;
    }>();
  });

  test("'version' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "version">>().type.toBe<{
      version?: boolean;
    }>();
  });

  test("'watch' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "watch">>().type.toBe<{
      watch?: boolean;
    }>();
  });
});

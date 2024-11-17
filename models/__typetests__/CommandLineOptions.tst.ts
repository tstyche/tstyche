import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

describe("CommandLineOptions", () => {
  test("all options", () => {
    expect<tstyche.CommandLineOptions>().type.toBeAssignableWith({
      config: "./config/tstyche.json",
      failFast: true,
      help: true,
      install: true,
      list: true,
      listFiles: true,
      only: "external",
      plugins: ["./tstyche-plugin.js"],
      reporters: ["./tstyche-reporter.js"],
      prune: true,
      showConfig: true,
      skip: "internal",
      target: ["4.9.5" as const, "5.0" as const, "latest" as const],
      tsconfig: "./tsconfig.test.json",
      update: true,
      version: true,
      watch: true,
    });
  });

  test("all options are optional", () => {
    expect<tstyche.CommandLineOptions>().type.toBeAssignableWith({});
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

  test("'list' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "list">>().type.toBe<{
      list?: boolean;
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

  test("'plugins' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "plugins">>().type.toBe<{
      plugins?: Array<string>;
    }>();
  });

  test("'reporters' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "reporters">>().type.toBe<{
      reporters?: Array<string>;
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

  test("'tsconfig' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "tsconfig">>().type.toBe<{
      tsconfig?: string;
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

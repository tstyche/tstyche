import { describe, expect, test } from "tstyche";
import type * as tstyche from "tstyche/tstyche";

describe("CommandLineOptions", () => {
  test("all options", () => {
    expect<tstyche.CommandLineOptions>().type.toBeAssignableFrom({
      config: "./config/tstyche.json",
      failFast: true,
      fetch: true,
      help: true,
      list: true,
      listFiles: true,
      only: "external",
      prune: true,
      quiet: true,
      reporters: ["./tstyche-reporter.js"],
      showConfig: true,
      skip: "internal",
      target: ["5.0" as const, "5.4" as const, "latest" as const],
      tsconfig: "./tsconfig.test.json",
      update: true,
      version: true,
      watch: true,
    });
  });

  test("all options are optional", () => {
    expect<tstyche.CommandLineOptions>().type.toBeAssignableFrom({});
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

  test("'fetch' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "fetch">>().type.toBe<{
      fetch?: boolean;
    }>();
  });

  test("'help' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "help">>().type.toBe<{
      help?: boolean;
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

  test("'quiet' option", () => {
    expect<Pick<tstyche.CommandLineOptions, "quiet">>().type.toBe<{
      quiet?: boolean;
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

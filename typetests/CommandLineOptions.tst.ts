import { describe, expect, test } from "tstyche";
import type { CommandLineOptions } from "tstyche/tstyche";

describe("CommandLineOptions", () => {
  test("all options", () => {
    expect<CommandLineOptions>().type.toBeAssignableFrom({
      config: "./config/json",
      failFast: true,
      fetch: true,
      help: true,
      list: true,
      listFiles: true,
      only: "external",
      prune: true,
      quiet: true,
      reporters: ["./tstyche-reporter.js"],
      root: "./example",
      showConfig: true,
      skip: "internal",
      target: ["5.4" as const, "5.8" as const, "latest" as const],
      tsconfig: "./tsconfig.test.json",
      update: true,
      verbose: true,
      version: true,
      watch: true,
    });
  });

  test("all options are optional", () => {
    expect<CommandLineOptions>().type.toBeAssignableFrom({});
  });

  test("'config' option", () => {
    expect<Pick<CommandLineOptions, "config">>().type.toBe<{
      config?: string;
    }>();
  });

  test("'failFast' option", () => {
    expect<Pick<CommandLineOptions, "failFast">>().type.toBe<{
      failFast?: boolean;
    }>();
  });

  test("'fetch' option", () => {
    expect<Pick<CommandLineOptions, "fetch">>().type.toBe<{
      fetch?: boolean;
    }>();
  });

  test("'help' option", () => {
    expect<Pick<CommandLineOptions, "help">>().type.toBe<{
      help?: boolean;
    }>();
  });

  test("'list' option", () => {
    expect<Pick<CommandLineOptions, "list">>().type.toBe<{
      list?: boolean;
    }>();
  });

  test("'listFiles' option", () => {
    expect<Pick<CommandLineOptions, "listFiles">>().type.toBe<{
      listFiles?: boolean;
    }>();
  });

  test("'only' option", () => {
    expect<Pick<CommandLineOptions, "only">>().type.toBe<{
      only?: string;
    }>();
  });

  test("'prune' option", () => {
    expect<Pick<CommandLineOptions, "prune">>().type.toBe<{
      prune?: boolean;
    }>();
  });

  test("'quiet' option", () => {
    expect<Pick<CommandLineOptions, "quiet">>().type.toBe<{
      quiet?: boolean;
    }>();
  });

  test("'reporters' option", () => {
    expect<Pick<CommandLineOptions, "reporters">>().type.toBe<{
      reporters?: Array<string>;
    }>();
  });

  test("'root' option", () => {
    expect<Pick<CommandLineOptions, "root">>().type.toBe<{
      root?: string;
    }>();
  });

  test("'showConfig' option", () => {
    expect<Pick<CommandLineOptions, "showConfig">>().type.toBe<{
      showConfig?: boolean;
    }>();
  });

  test("'skip' option", () => {
    expect<Pick<CommandLineOptions, "skip">>().type.toBe<{
      skip?: string;
    }>();
  });

  test("'target' option", () => {
    expect<Pick<CommandLineOptions, "target">>().type.toBe<{
      target?: Array<string>;
    }>();
  });

  test("'tsconfig' option", () => {
    expect<Pick<CommandLineOptions, "tsconfig">>().type.toBe<{
      tsconfig?: string;
    }>();
  });

  test("'update' option", () => {
    expect<Pick<CommandLineOptions, "update">>().type.toBe<{
      update?: boolean;
    }>();
  });

  test("'verbose' option", () => {
    expect<Pick<CommandLineOptions, "verbose">>().type.toBe<{
      verbose?: boolean;
    }>();
  });

  test("'version' option", () => {
    expect<Pick<CommandLineOptions, "version">>().type.toBe<{
      version?: boolean;
    }>();
  });

  test("'watch' option", () => {
    expect<Pick<CommandLineOptions, "watch">>().type.toBe<{
      watch?: boolean;
    }>();
  });
});

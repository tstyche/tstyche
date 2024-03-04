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
    });
  });

  test("'config' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      config?: string;
    }>();
  });

  test("'failFast' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      failFast?: boolean;
    }>();
  });

  test("'help' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      help?: boolean;
    }>();
  });

  test("'install' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      install?: boolean;
    }>();
  });

  test("'listFiles' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      listFiles?: boolean;
    }>();
  });

  test("'only' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      only?: string;
    }>();
  });

  test("'prune' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      prune?: boolean;
    }>();
  });

  test("'showConfig' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      showConfig?: boolean;
    }>();
  });

  test("'skip' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      skip?: string;
    }>();
  });

  test("'target' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      target?: Array<string>;
    }>();
  });

  test("'update' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      update?: boolean;
    }>();
  });

  test("'version' option", () => {
    expect<tstyche.CommandLineOptions>().type.toMatch<{
      version?: boolean;
    }>();
  });
});

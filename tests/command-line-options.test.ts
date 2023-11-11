import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "command-line-options";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("command line options", () => {
  test("'--target' option", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--target 4.8,latest"]);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });

  test("handles not supported '--target' option value", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--target new"]);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list of versions.",
        "Usage examples:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
  });
});

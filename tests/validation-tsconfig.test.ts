import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixture = "validation-tsconfig";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("tsconfig", () => {
  test("has errors", async () => {
    const tsconfig = {
      compilerOptions: {
        noEmitOnError: true,
        strict: "yes",
        strictNullChecks: true,
      },
      extends: "../tsconfig.json",
      include: ["./"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("does not exist", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { status, stderr } = spawnTyche(fixture);

    expect(stderr).toMatch(/^Warning: The default compiler options are used for the following tests files./);

    expect(status).toBe(1);
  });
});

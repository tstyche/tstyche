import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixture = "validation-runner";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("compiler options", () => {
  test("when no test files are present", async () => {
    await writeFixture(fixture, {
      ["tstyche.config.json"]: "{}",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when search string does not select test files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["sample"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when TSConfig file has errors", async () => {
    const tsconfig = {
      compilerOptions: {
        noEmitOnError: true,
        strict: "yes",
        strictNullChecks: true,
      },
      extends: "../tsconfig.json",
      include: ["**/*"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});

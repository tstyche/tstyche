import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("validation-runner", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("compiler options", () => {
  test("when TSConfig file has errors", async () => {
    const tsconfig = {
      compilerOptions: {
        noEmitOnError: true,
        strict: "yes",
        strictNullChecks: true,
      },
      extends: "../../tsconfig.json",
      include: ["**/*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});

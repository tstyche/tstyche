import { afterEach, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";

declare function one(a: string): void;

test("is syntax error?", () => {
  one(());
});

test("is syntax error?", () => {
  one(
});

test("is skipped?", () => {
  expect(one("abc")).type.toBeVoid();
});

test("is broken?"
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const fixtureUrl = getFixtureUrl("validation-syntax-errors", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

test("when syntax errors are encountered", async () => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/dummy.test.ts"]: isStringTestText,
    ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
  });

  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

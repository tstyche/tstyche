import { expect, test } from "@jest/globals";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("feature-cjs-support");

test("supports CJS projects written CJS syntax", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["cjs-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(0);
});

test("supports CJS projects written in ESM syntax", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["esm-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(0);
});

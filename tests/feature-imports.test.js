import { expect, test } from "@jest/globals";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("feature-imports");

test("named imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["named"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("aliased imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["aliased"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("namespace imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["namespace"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

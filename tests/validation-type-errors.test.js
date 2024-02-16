import { expect, test } from "@jest/globals";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-type-errors");

test("handles top level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["top-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles describe level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["describe-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles test level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles matcher level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["matcher-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

import { expect, test } from "@jest/globals";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-expect");

// TODO check for validation errors
// TODO expect cannot be nested because of run mode flags must be inherited

test("handles '--failFast' option", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["fail-fast-expect.tst.ts", "--failFast"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("expect.only.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("expect.only.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

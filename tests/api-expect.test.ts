import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-expect";

// TODO check for validation errors
// TODO expect cannot be nested because of run mode flags must be inherited

test("expect", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["top-level-expect.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles '--failFast' option", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["top-level-expect.tst.ts", "--failFast"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["expect-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["expect-only.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("expect.only.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["expect-only-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("expect.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["expect-skip.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("expect.only.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["expect-skip-fail.test.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "validation-type-errors";

test("handles top level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["top-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles describe level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["describe-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles test level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["test-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("handles matcher level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["matcher-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

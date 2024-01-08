import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "type-error";

test("handles top level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["top-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles describe level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["describe-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles test level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["test-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles matcher level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["matcher-level"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

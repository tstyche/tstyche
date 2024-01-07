import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-test";

test("handles nested 'test()'", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["nested"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("test.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["only"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("test.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("test.todo", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-test";

test("handles nested 'test()'", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["nested"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("test.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["only"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("test.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("test.todo", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

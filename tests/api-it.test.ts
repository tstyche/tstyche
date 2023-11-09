import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-it";

test("handles nested 'it()'", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["nested"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("it.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["only"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("it.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("it.todo", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

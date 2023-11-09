import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-describe";

test("includes nested", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["nested"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("describe.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["only"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("describe.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("describe.todo", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("handles 'expect()' nested within 'describe()'", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["describe-level-expect"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

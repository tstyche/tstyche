import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-context";

test("includes nested", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["nested"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("context.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["only"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("context.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("context.todo", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("handles 'expect()' nested within 'context()'", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["context-level-expect"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

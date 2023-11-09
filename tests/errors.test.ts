import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

test("handles syntax errors", () => {
  const { status, stderr, stdout } = spawnTyche("syntax-error");

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

const fixture = "type-error";

test("handles top level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["top-level"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles describe level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["describe-level"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles test level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["test-level"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles matcher level type errors", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["matcher-level"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles tsconfig option errors", () => {
  const { status, stderr, stdout } = spawnTyche("tsconfig-option-error");

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

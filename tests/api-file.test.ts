import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-file";

test("allows a file to be empty", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-file"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only an empty describe", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-describe"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only empty tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-test"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only skipped tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip-file"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only todo tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo-file"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

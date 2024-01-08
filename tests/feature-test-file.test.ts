import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "feature-test-file";

test("allows a file to be empty", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only an empty describe", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-describe"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only empty tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["empty-test"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only skipped tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["skip-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("allows a file to have only todo tests", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["todo-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "feature-test-file";

test("allows a file to be empty", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["empty-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("allows a file to have only an empty describe", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["empty-describe"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("allows a file to have only empty tests", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["empty-test"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("allows a file to have only skipped tests", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["skip-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("allows a file to have only todo tests", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["todo-file"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

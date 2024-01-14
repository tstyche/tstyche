import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-describe";

test("includes nested", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["nested"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("describe.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["only"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("describe.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["skip"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("describe.todo", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["todo"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("handles 'expect()' nested within 'describe()'", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["describe-level-expect"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

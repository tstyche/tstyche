import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-describe");

test("includes nested", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["nested"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'describe()' implementation'", () => {
  expect(tstyche.describe).toBeInstanceOf(Function);
});

test("'describe.only' implementation'", () => {
  expect(tstyche.describe.only).toBeInstanceOf(Function);
});

test("describe.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'describe.skip' implementation'", () => {
  expect(tstyche.describe.skip).toBeInstanceOf(Function);
});

test("describe.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'describe.todo' implementation'", () => {
  expect(tstyche.describe.todo).toBeInstanceOf(Function);
});

test("describe.todo", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("handles 'expect()' nested within 'describe()'", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["describe-level-expect"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-test");

test("handles nested 'test()'", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["nested"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("'test()' implementation", () => {
  expect(tstyche.test).toBeInstanceOf(Function);
});

test("'test.only' implementation", () => {
  expect(tstyche.test.only).toBeInstanceOf(Function);
});

test("test.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'test.skip' implementation", () => {
  expect(tstyche.test.skip).toBeInstanceOf(Function);
});

test("test.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'test.todo' implementation", () => {
  expect(tstyche.test.todo).toBeInstanceOf(Function);
});

test("test.todo", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-expect");

// TODO check for validation errors
// TODO currently 'expect()' cannot be nested because run mode flags are not inherited

test("handles '--failFast' option", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["fail-fast-expect.tst.ts", "--failFast"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("'expect()' implementation'", () => {
  expect(tstyche.expect).toBeInstanceOf(Function);
});

test("'expect.fail' implementation'", () => {
  expect(tstyche.expect.fail).toBeInstanceOf(Function);
});

test("expect.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-fail.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("'expect.only' implementation'", () => {
  expect(tstyche.expect.only).toBeInstanceOf(Function);
});

test("expect.only", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'expect.only.fail' implementation'", () => {
  expect(tstyche.expect.only.fail).toBeInstanceOf(Function);
});

test("expect.only.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only-fail.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

test("'expect.skip' implementation'", () => {
  expect(tstyche.expect.skip).toBeInstanceOf(Function);
});

test("expect.skip", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("'expect.skip.fail' implementation'", () => {
  expect(tstyche.expect.skip.fail).toBeInstanceOf(Function);
});

test("expect.skip.fail", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip-fail.tst.ts"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

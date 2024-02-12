import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-toBeNull");

test("'toBeNull' implementation", () => {
  expect(tstyche.expect).toHaveProperty("type.toBeNull", expect.any(Function));
});

test("toBeNull", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

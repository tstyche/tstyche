import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-toBeUnknown");

test("'toBeUnknown' implementation", () => {
  expect(tstyche.expect).toHaveProperty("type.toBeUnknown", expect.any(Function));
});

test("toBeUnknown", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

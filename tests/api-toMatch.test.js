import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-toMatch");

test("'toMatch' implementation", () => {
  expect(tstyche.expect).toHaveProperty("type.toMatch", expect.any(Function));
});

test("toMatch", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

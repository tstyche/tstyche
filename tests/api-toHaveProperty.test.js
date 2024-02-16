import { expect, test } from "@jest/globals";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("api-toHaveProperty");

test("'toHaveProperty' implementation", () => {
  expect(tstyche.expect).toHaveProperty("type.toHaveProperty", expect.any(Function));
});

test("toHaveProperty", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(exitCode).toBe(1);
});

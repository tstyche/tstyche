import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

test("toBeUndefined", () => {
  const { status, stderr, stdout } = spawnTyche("api-toBeUndefined");

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

test("toEqual", () => {
  const { status, stderr, stdout } = spawnTyche("validation-toEqual");

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "feature-cjs-support";

test("supports CJS projects written CJS syntax", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["cjs-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(0);
});

test("supports CJS projects written in ESM syntax", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["esm-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(exitCode).toBe(0);
});

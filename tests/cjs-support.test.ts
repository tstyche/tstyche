import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "cjs-support";

test("supports CJS projects written CJS syntax", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["cjs-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(0);
});

test("supports CJS projects written in ESM syntax", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["esm-syntax"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

  expect(status).toBe(0);
});

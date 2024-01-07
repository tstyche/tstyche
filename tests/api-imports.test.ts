import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-imports";

test("named imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["named"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("aliased imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["aliased"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("namespace imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["namespace"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

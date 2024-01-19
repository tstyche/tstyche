import { expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "feature-imports";

test("named imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["named"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("aliased imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["aliased"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

test("namespace imports", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["namespace"]);

  expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});

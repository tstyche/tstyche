import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-imports";

test("named imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["named"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("aliased imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["aliased"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("namespace imports", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["namespace"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

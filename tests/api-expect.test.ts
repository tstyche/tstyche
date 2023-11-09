import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-expect";

// TODO check for validation errors
// TODO expect cannot be nested because of run mode flags must be inherited

test("expect", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["top-level-expect.tst.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("handles '--failFast' option", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["top-level-expect.tst.ts", "--failFast"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("expect.fail", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["expect-fail.test.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("expect.only", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["expect-only.test.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("expect.only.fail", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["expect-only-fail.test.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

test("expect.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["expect-skip.test.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toBe("");

  expect(status).toBe(0);
});

test("expect.only.skip", () => {
  const { status, stderr, stdout } = spawnTyche(fixture, ["expect-skip-fail.test.ts"]);

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

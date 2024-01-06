import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

test("toBeCallableWith", () => {
  const { status, stderr, stdout } = spawnTyche("validation-toBeCallableWith");

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

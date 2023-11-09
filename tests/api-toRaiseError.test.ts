import { expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

test("toRaiseError", () => {
  const { status, stderr, stdout } = spawnTyche("api-toRaiseError");

  expect(stdout).toMatchSnapshot("stdout");
  expect(stderr).toMatchSnapshot("stderr");

  expect(status).toBe(1);
});

import assert from "node:assert";
import path from "node:path";
import test from "node:test";
import { InMemoryFiles } from "tstyche/tstyche";

/**
 * @type {import("tstyche/tstyche").FileTree}
 */
const testFiles = {
  ["./__typetests__/isString.test.ts"]: "isStringText",
  [path.resolve("./ts-tests/isNumber.test.ts")]: "isNumberText",
  ["isBoolean.test.ts"]: "isBooleanText",
  ["../isIgnored.test.ts"]: "isIgnored",
};

const inMemoryFiles = new InMemoryFiles(".").add(testFiles);

test("InMemoryFiles", async (t) => {
  await t.test("'getEntries()' method", () => {
    assert.deepEqual(inMemoryFiles.getEntries(path.resolve(".").replace(/\\/g, "/")), {
      directories: ["__typetests__", "ts-tests"],
      files: ["isBoolean.test.ts"],
    });

    assert.deepEqual(inMemoryFiles.getEntries(path.resolve("./__typetests__").replace(/\\/g, "/")), {
      directories: [],
      files: ["isString.test.ts"],
    });

    assert.deepEqual(inMemoryFiles.getEntries(path.resolve("./ts-tests").replace(/\\/g, "/")), {
      directories: [],
      files: ["isNumber.test.ts"],
    });
  });

  await t.test("'hasDirectory()' method", () => {
    assert(inMemoryFiles.hasDirectory(path.resolve(".").replace(/\\/g, "/")));

    assert(inMemoryFiles.hasDirectory(path.resolve("./__typetests__").replace(/\\/g, "/")));

    assert(inMemoryFiles.hasDirectory(path.resolve("./ts-tests").replace(/\\/g, "/")));

    assert(!inMemoryFiles.hasDirectory(path.resolve("..").replace(/\\/g, "/")));
  });

  await t.test("'hasFile()' method", () => {
    assert(inMemoryFiles.hasFile(path.resolve("./__typetests__/isString.test.ts").replace(/\\/g, "/")));

    assert(inMemoryFiles.hasFile(path.resolve("./ts-tests/isNumber.test.ts").replace(/\\/g, "/")));

    assert(inMemoryFiles.hasFile(path.resolve("./isBoolean.test.ts").replace(/\\/g, "/")));

    assert(!inMemoryFiles.hasFile(path.resolve("../isIgnored.test.ts").replace(/\\/g, "/")));
  });

  await t.test("'getFile()' method", () => {
    assert.strictEqual(
      inMemoryFiles.getFile(path.resolve("./__typetests__/isString.test.ts").replace(/\\/g, "/")),
      "isStringText",
    );

    assert.strictEqual(
      inMemoryFiles.getFile(path.resolve("./ts-tests/isNumber.test.ts").replace(/\\/g, "/")),
      "isNumberText",
    );

    assert.strictEqual(inMemoryFiles.getFile(path.resolve("./isBoolean.test.ts").replace(/\\/g, "/")), "isBooleanText");

    assert.strictEqual(inMemoryFiles.getFile(path.resolve("../isIgnored.test.ts").replace(/\\/g, "/")), undefined);
  });
});

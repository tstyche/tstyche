import assert from "node:assert";
import path from "node:path";
import test from "node:test";
import { FileSystem, InMemoryFiles } from "tstyche/tstyche";

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

FileSystem.addInMemoryFiles(inMemoryFiles);

// TODO add a fixture with real files
//      - check if 'FileSystem' is merging real and memory files
//      - check is 'FileSystem' is overriding real files

test("FileSystem", async (t) => {
  await t.test("'directoryExists()' method", () => {
    assert(FileSystem.directoryExists(path.resolve(".").replace(/\\/g, "/")));

    assert(FileSystem.directoryExists(path.resolve("./__typetests__").replace(/\\/g, "/")));

    assert(FileSystem.directoryExists(path.resolve("./ts-tests").replace(/\\/g, "/")));
  });

  await t.test("'fileExists()' method", () => {
    assert(FileSystem.fileExists(path.resolve("./__typetests__/isString.test.ts").replace(/\\/g, "/")));

    assert(FileSystem.fileExists(path.resolve("./ts-tests/isNumber.test.ts").replace(/\\/g, "/")));

    assert(FileSystem.fileExists(path.resolve("./isBoolean.test.ts").replace(/\\/g, "/")));

    assert(!FileSystem.fileExists(path.resolve("../isIgnored.test.ts").replace(/\\/g, "/")));
  });

  await t.test("'readFile()' method", () => {
    assert.strictEqual(
      FileSystem.readFile(path.resolve("./__typetests__/isString.test.ts").replace(/\\/g, "/")),
      "isStringText",
    );

    assert.strictEqual(
      FileSystem.readFile(path.resolve("./ts-tests/isNumber.test.ts").replace(/\\/g, "/")),
      "isNumberText",
    );

    assert.strictEqual(FileSystem.readFile(path.resolve("./isBoolean.test.ts").replace(/\\/g, "/")), "isBooleanText");

    assert.strictEqual(FileSystem.readFile(path.resolve("../isIgnored.test.ts").replace(/\\/g, "/")), undefined);
  });

  await t.test("'getAccessibleFileSystemEntries()' method", () => {
    // assert.strictEqual(FileSystem.getAccessibleFileSystemEntries(path.resolve(".").replace(/\\/g, "/")), {});

    assert.deepStrictEqual(
      FileSystem.getAccessibleFileSystemEntries(path.resolve("./__typetests__").replace(/\\/g, "/")),
      { directories: [], files: ["isString.test.ts"] },
    );

    assert.deepStrictEqual(FileSystem.getAccessibleFileSystemEntries(path.resolve("./ts-tests").replace(/\\/g, "/")), {
      directories: [],
      files: ["isNumber.test.ts"],
    });
  });

  await t.test("'removeInMemoryFiles()' method", () => {
    FileSystem.removeInMemoryFiles();

    assert(!FileSystem.fileExists(path.resolve("./__typetests__/isString.test.ts").replace(/\\/g, "/")));
    assert(!FileSystem.directoryExists(path.resolve("./__typetests__").replace(/\\/g, "/")));
  });
});

import { strict as assert } from "node:assert/strict";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import process from "node:process";

export { doesNotMatch, equal, match, notEqual } from "node:assert/strict";

/**
 * @param {Record<string, unknown> | string} source
 * @param {Record<string, unknown>} target
 */
export function matchObject(source, target) {
  if (typeof source === "string") {
    source = /** @type {Record<string, unknown>} */ (JSON.parse(source));
  }

  for (const key of Object.keys(target)) {
    assert.equal(key in source, true, `Target does not have the '${key}' property.`);
    assert.deepEqual(source[key], target[key], `Values of the '${key}' properties do not match.`);
  }
}

/**
 * @param {string} source
 * @param {{ fileName: string, testFileUrl: string }} snapshot
 */
export async function matchSnapshot(source, snapshot) {
  const snapshotFileUrl = new URL(`__snapshots__/${snapshot.fileName}.snap.txt`, snapshot.testFileUrl);

  if (existsSync(snapshotFileUrl) && !process.argv.includes("--update")) {
    const target = await fs.readFile(snapshotFileUrl, { encoding: "utf8" });

    assert.equal(source.replace(/\r\n/g, "\n"), target.replace(/\r\n/g, "\n"));
  } else {
    if (process.env["CI"] != null) {
      throw new Error("Snapshots cannot be created in CI environment.");
    }

    await fs.mkdir(new URL("__snapshots__", snapshot.testFileUrl), { recursive: true });
    await fs.writeFile(snapshotFileUrl, source);
  }
}

/**
 * @param {string | URL} source
 */
export function pathExists(source) {
  assert(existsSync(source), `Path '${source.toString()}' does not exist.`);
}

/**
 * @param {string | URL} source
 */
export function pathDoesNotExist(source) {
  assert(!existsSync(source), `Path '${source.toString()}' exists.`);
}

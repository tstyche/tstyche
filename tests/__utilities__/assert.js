import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { strict as assert } from "poku";

export const { doesNotMatch, equal, match, notEqual } = assert;

/**
 * @param {Record<string, unknown> | string} source
 * @param {Record<string, unknown>} target
 */
export function matchObject(source, target) {
  if (typeof source === "string") {
    source = /** @type {{ version: string }} */ (JSON.parse(source));
  }

  for (const targetKey of Object.keys(target)) {
    assert.equal(targetKey in source, true, `Target has the '${targetKey}' property.`);
    assert.deepEqual(source[targetKey], target[targetKey], `Values of the '${targetKey}' properties match.`);
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
  assert(existsSync(source), `Path ${source.toString()} exists.`);
}

/**
 * @param {string | URL} source
 */
export function pathDoesNotExist(source) {
  assert(!existsSync(source), `Path ${source.toString()} does not exist.`);
}

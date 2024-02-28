import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";

export { doesNotMatch, strictEqual as equal, match, notStrictEqual as notEqual } from "node:assert";

/**
 * @param {string | URL} source
 */
export function fileExists(source) {
  assert.equal(existsSync(source), true, `File ${source.toString()} does not exist.`);
}

/**
 * @param {string | URL} source
 */
export function fileDoesNotExists(source) {
  assert.equal(existsSync(source), false, `File ${source.toString()} exists.`);
}

/**
 * @param {Record<string, unknown> | string} source
 * @param {Record<string, unknown>} target
 */
export function matchObject(source, target) {
  if (typeof source === "string") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    source = /** @type {{ version: string }} */ (JSON.parse(source));
  }

  for (const targetKey of Object.keys(target)) {
    assert.equal(targetKey in source, true, `The '${targetKey}' property does not exist.`);
    assert.deepEqual(source[targetKey], target[targetKey], `Values of the '${targetKey}' properties do not match.`);
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

    assert.equal(
      source.replace(/\r\n/g, "\n"),
      target.replace(/\r\n/g, "\n"),
    );
  } else {
    if (process.env["CI"] != null) {
      throw new Error("Snapshots cannot be created in CI environment.");
    }

    await fs.mkdir(new URL("__snapshots__", snapshot.testFileUrl), { recursive: true });
    await fs.writeFile(snapshotFileUrl, source);
  }
}

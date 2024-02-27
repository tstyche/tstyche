import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";

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

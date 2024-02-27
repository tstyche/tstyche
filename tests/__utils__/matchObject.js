import { strict as assert } from "node:assert";

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
    assert.equal(targetKey in source, true, `The '${targetKey}' property does not exist in the target.`);
    assert.deepEqual(source[targetKey], target[targetKey], `The value of the '${targetKey}' property does not match.`);
  }
}

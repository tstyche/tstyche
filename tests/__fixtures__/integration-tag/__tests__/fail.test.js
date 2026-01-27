import assert from "node:assert/strict";
import tstyche from "tstyche/tag";

await assert.rejects(async () => {
  await tstyche`isNumber --quiet`;
}, "Error: TSTyche test run failed. Check the output above for details.");

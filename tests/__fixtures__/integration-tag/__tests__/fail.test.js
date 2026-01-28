import assert from "node:assert/strict";
import tstyche from "tstyche/tag";
import { getFixtureUrl } from "./getFixtureUrl.js";

const fixtureUrl = getFixtureUrl(import.meta);

await assert.rejects(async () => {
  await tstyche`isNumber --quiet --rootPath ${fixtureUrl}`;
}, "Error: TSTyche test run failed. Check the output above for details.");

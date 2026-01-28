import tstyche from "tstyche/tag";
import { getFixtureUrl } from "./getFixtureUrl.js";

const fixtureUrl = getFixtureUrl(import.meta);

await tstyche`isString --quiet --rootPath ${fixtureUrl}`;

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { create } from "ts-node";
import ts from "typescript";

/** @type {Map<string, import("ts-node").Service>} */
const serviceCache = new Map();

const thisFileText = await fs.readFile(new URL(import.meta.url), "utf8");

/** @param {string} fileName */
function getService(fileName) {
  const tsconfigPath = ts.findConfigFile(fileName, (path) => ts.sys.fileExists(path));

  const project = tsconfigPath ?? ".";

  let service = serviceCache.get(project);

  if (service) {
    return service;
  }

  service = create({ project, transpileOnly: true });
  serviceCache.set(project, service);

  return service;
}

/** @type {import("@jest/transform").SyncTransformer} */
const transformer = {
  canInstrument: false,

  getCacheKey(sourceText, fileName, { configString, config }) {
    const service = getService(fileName);
    const compilerOptions = service.config.options;

    return createHash("sha256")
      .update(thisFileText)
      .update("\0", "utf8")
      .update(sourceText)
      .update("\0", "utf8")
      .update(path.relative(config.rootDir, fileName))
      .update("\0", "utf8")
      .update(JSON.stringify(compilerOptions))
      .update("\0", "utf8")
      .update(configString)
      .update("\0", "utf8")
      .update(process.version)
      .digest("hex")
      .slice(0, 32);
  },

  process(sourceText, fileName) {
    const service = getService(fileName);
    const outputText = service.compile(sourceText, fileName);

    return { code: outputText };
  },
};

export default transformer;

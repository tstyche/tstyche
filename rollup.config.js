import fs from "node:fs/promises";
import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import MagicString from "magic-string";
import dts from "rollup-plugin-dts";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

const output = {
  dir: "./build",
};

/**
 * @returns {import("rollup").Plugin}
 */
function tidyJs() {
  const binEntry = "bin.js";
  const tstycheEntry = "tstyche.js";

  return {
    name: "tidy-js",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.replaceAll("../../package.json", "../package.json");

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }

      return null;
    },

    async writeBundle() {
      const cliEntryFilePath = path.resolve(output.dir, binEntry);

      return fs.chmod(cliEntryFilePath, 0o755);
    },
  };
}

/**
 * @returns {import("rollup").Plugin}
 */
function tidyDts() {
  const tstycheEntry = "tstyche.d.ts";

  return {
    name: "tidy-dts",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.prepend('/// <reference types="node" resolution-mode="require"/>\n\n');

        magicString.replaceAll("import", "import type");

        magicString.replaceAll("const enum", "enum");

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }

      return null;
    },
  };
}

/** @type {Array<import("rollup").RollupOptions>} */
const config = [
  {
    input: {
      index: "./src/types.ts",
      tstyche: "./src/tstyche.ts",
    },
    output,
    // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
    plugins: [tsconfigPaths(), dts(), tidyDts()],
  },

  {
    input: "./src/types.ts",
    output: {
      file: "./build/index.d.cts",
      format: "cjs",
    },
    plugins: [dts()],
  },

  {
    external: [/^node:/, "./tstyche.js"],
    input: {
      bin: "./src/bin.ts",
      index: "./src/main.ts",
      loader: "./src/loader.ts",
      tstyche: "./src/tstyche.ts",
    },
    output,
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ compilerOptions: { removeComments: true } }),
      tidyJs(),
    ],
  },

  {
    input: "./src/main.ts",
    output: {
      file: "./build/index.cjs",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ compilerOptions: { removeComments: true } }),
    ],
  },
];

export default config;

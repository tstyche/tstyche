import fs from "node:fs/promises";
import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import MagicString from "magic-string";
import dts from "rollup-plugin-dts";

const output = { dir: "./build" };

const tsconfig = "./source/tsconfig.json";

const packageConfigText = await fs.readFile(new URL("./package.json", import.meta.url), { encoding: "utf8" });
const { version } = /** @type {{ version: string }} */ (JSON.parse(packageConfigText));

/** @returns {import("rollup").Plugin} */
function clean() {
  return {
    name: "clean",

    async buildStart() {
      await fs.rm(output.dir, { force: true, recursive: true });
    },
  };
}

/** @returns {import("rollup").Plugin} */
function tidyJs() {
  const binEntry = "bin.js";
  const tstycheEntry = "tstyche.js";

  return {
    name: "tidy-js",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.replaceAll("__version__", version);

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }

      return null;
    },

    async writeBundle() {
      const cliEntryFilePath = path.resolve(output.dir, binEntry);

      await fs.chmod(cliEntryFilePath, 0o755);
    },
  };
}

/** @returns {import("rollup").Plugin} */
function tidyDts() {
  const tstycheEntry = "tstyche.d.ts";

  return {
    name: "tidy-dts",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.replaceAll("import", "import type");

        magicString.replaceAll("const enum", "enum");

        magicString.replaceAll("__version__", version);

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
    external: [/^node:/],
    input: {
      index: "./source/types.ts",
      tstyche: "./source/tstyche.ts",
    },
    output,
    plugins: [
      clean(),
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ tsconfig }),
      dts({ tsconfig }),
      tidyDts(),
    ],
  },

  {
    input: "./source/types.ts",
    output: {
      file: "./build/index.d.cts",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ tsconfig }),
      dts({ tsconfig }),
    ],
  },

  {
    external: [/^node:/, "./tstyche.js"],
    input: {
      bin: "./source/bin.ts",
      index: "./source/index.ts",
      tstyche: "./source/tstyche.ts",
    },
    output,
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ compilerOptions: { removeComments: true }, tsconfig }),
      tidyJs(),
    ],
  },

  {
    input: "./source/index.ts",
    output: {
      file: "./build/index.cjs",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ compilerOptions: { removeComments: true }, tsconfig }),
    ],
  },
];

export default config;

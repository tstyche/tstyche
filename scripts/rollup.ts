import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "@rollup/plugin-typescript";
import MagicString from "magic-string";
import type { Plugin, RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";
import packageConfig from "../package.json" with { type: "json" };

const output = { dir: "./dist" };
const tsconfig = fileURLToPath(new URL("../source/tsconfig.json", import.meta.url));

function clean(): Plugin {
  return {
    name: "clean",

    async buildStart() {
      await fs.rm(output.dir, { force: true, recursive: true });
    },
  };
}

function tidyJs(): Plugin {
  const binEntry = "bin.js";

  return {
    name: "tidy-js",

    renderChunk(code) {
      const magicString = new MagicString(code);

      magicString.replaceAll("__version__", packageConfig.version);

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    },

    async writeBundle() {
      const cliEntryFilePath = path.resolve(output.dir, binEntry);

      await fs.chmod(cliEntryFilePath, 0o755);
    },
  };
}

function tidyDts(): Plugin {
  return {
    name: "tidy-dts",

    renderChunk(code) {
      const magicString = new MagicString(code);

      magicString.replaceAll("import", "import type");

      magicString.replaceAll("const enum", "enum");

      magicString.replaceAll("__version__", packageConfig.version);

      return {
        code: magicString.toString(),
        map: magicString.generateMap({ hires: true }),
      };
    },
  };
}

const config: Array<RollupOptions> = [
  {
    external: [/^node:/, "./tstyche.js"],
    input: {
      tag: "./source/tag.ts",
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
      file: "./dist/index.d.cts",
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
      tag: "./source/tag.ts",
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
      file: "./dist/index.cjs",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ compilerOptions: { removeComments: true }, tsconfig }),
    ],
  },
];

export default config;

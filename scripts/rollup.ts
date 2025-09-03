import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "@rollup/plugin-typescript";
import MagicString from "magic-string";
import type { Plugin, RollupOptions } from "rollup";
import dts from "rollup-plugin-dts";
import packageConfig from "../package.json" with { type: "json" };

const output = { dir: "./build" };
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
  const tstycheEntry = "tstyche.js";

  return {
    name: "tidy-js",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.replaceAll("__version__", packageConfig.version);

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

function tidyDts(): Plugin {
  const tstycheEntry = "tstyche.d.ts";

  return {
    name: "tidy-dts",

    renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName === tstycheEntry) {
        const magicString = new MagicString(code);

        magicString.replaceAll("import", "import type");

        magicString.replaceAll("const enum", "enum");

        magicString.replaceAll("__version__", packageConfig.version);

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      }

      return null;
    },
  };
}

// TODO remove this plugin and 'package.json' entries after dropping support for TypeScript 4.x
function ts4Dts(): Plugin {
  return {
    name: "ts4-dts",

    async renderChunk(code, chunkInfo) {
      if (chunkInfo.fileName.startsWith("index")) {
        const updatedCode = code.replace(
          / {4}\/\*\*\n {5}\* Checks if the decorator[\s\S]*DecoratorContext\) => void;\n/,
          "",
        );

        await fs.mkdir(path.resolve(output.dir, "4.x"), { recursive: true });
        await fs.writeFile(path.resolve(output.dir, "4.x", chunkInfo.fileName), updatedCode);
      }

      return null;
    },
  };
}

const config: Array<RollupOptions> = [
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
      ts4Dts(),
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
      ts4Dts(),
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

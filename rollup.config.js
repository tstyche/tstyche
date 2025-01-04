import fs from "node:fs/promises";
import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import MagicString from "magic-string";
import dts from "rollup-plugin-dts";

const output = {
  dir: "./build",
};

const packageConfigText = await fs.readFile(new URL("./package.json", import.meta.url), { encoding: "utf8" });
const { version } = /** @type {{ version: string }} */ (JSON.parse(packageConfigText));

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
function mochaLike() {
  // Adding a CJS package.json allows IDE reporters which rely on
  // `require.main` (*cough*JetBrains*cough*) to still function.
  const packageJson = JSON.stringify(
    {
      name: "tstyche-as-mocha",
      type: "commonjs",
    },
    undefined,
    2,
  ).concat("\n");

  return {
    name: "cjs-package-json",
    /** @this {import("rollup").PluginContext} this */
    buildStart() {
      this.emitFile({
        code: packageJson,
        fileName: "package.json",
        type: "prebuilt-chunk",
      });
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
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ tsconfig: "./source/tsconfig.json" }),
      dts({ tsconfig: "./source/tsconfig.json" }),
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
      typescript({ tsconfig: "./source/tsconfig.json" }),
      dts({ tsconfig: "./source/tsconfig.json" }),
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
      typescript({ compilerOptions: { removeComments: true }, tsconfig: "./source/tsconfig.json" }),
      tidyJs(),
    ],
  },

  {
    external: [/^node:/, "mocha"],
    input: "./as-mocha/mocha.ts",
    output: {
      file: "./as-mocha/build/mocha.js",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ tsconfig: "./as-mocha/tsconfig.json" }),
      mochaLike(),
      tidyJs(),
    ],
  },

  {
    external: [/^node:/, "mocha"],
    input: ["./as-mocha/lib/reporters/base.ts"],
    output: {
      dir: "./as-mocha/build/lib/reporters/",
      format: "cjs",
    },
    plugins: [
      // @ts-expect-error TODO: https://github.com/rollup/plugins/issues/1541
      typescript({ tsconfig: "./as-mocha/tsconfig.json" }),
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
      typescript({ compilerOptions: { removeComments: true }, tsconfig: "./source/tsconfig.json" }),
    ],
  },
];

export default config;

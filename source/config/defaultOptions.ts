import { environmentOptions } from "#environment";
import { Path } from "#path";
import type { ConfigFileOptions } from "./types.js";

export const defaultOptions: Required<ConfigFileOptions> = {
  failFast: false,
  plugins: [],
  reporters: ["list", "summary"],
  rootPath: Path.resolve("./"),
  target: environmentOptions.typescriptPath != null ? ["current"] : ["latest"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
  tsconfig: "findup",
};

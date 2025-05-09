import { environmentOptions } from "#environment";
import { Path } from "#path";
import type { ConfigFileOptions } from "./types.js";

export const defaultOptions: Required<ConfigFileOptions> = {
  checkSourceFiles: true,
  failFast: false,
  import: [],
  plugins: [],
  rejectAnyType: true,
  rejectNeverType: true,
  reporters: ["list", "summary"],
  rootPath: Path.resolve("./"),
  target: environmentOptions.typescriptModule != null ? ["current"] : ["latest"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
  tsconfig: "findup",
};

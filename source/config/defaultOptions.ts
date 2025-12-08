import { Path } from "#path";
import type { ConfigFileOptions } from "./types.js";

export const defaultOptions: Required<ConfigFileOptions> = {
  checkDeclarationFiles: true,
  checkSuppressedErrors: true,
  failFast: false,
  fixtureFileMatch: ["**/__fixtures__/*.{ts,tsx}", "**/fixtures/*.{ts,tsx}"],
  legacyToBe: false,
  plugins: [],
  rejectAnyType: true,
  rejectNeverType: true,
  reporters: ["list", "summary"],
  rootPath: Path.resolve("./"),
  target: ["*"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
  tsconfig: "findup",
};

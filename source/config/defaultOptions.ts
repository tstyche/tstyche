import type { ConfigFileOptions } from "./types.js";

export const defaultOptions: Required<ConfigFileOptions> = {
  checkDeclarationFiles: true,
  checkSuppressedErrors: true,
  failFast: false,
  fixtureFileMatch: ["**/__fixtures__/*.{ts,tsx}", "**/fixtures/*.{ts,tsx}"],
  quiet: false,
  rejectAnyType: true,
  rejectNeverType: true,
  reporters: ["list", "summary"],
  target: ["*"],
  testFileMatch: ["**/*.tst.*", "**/__typetests__/*.test.*", "**/typetests/*.test.*"],
  tsconfig: "findup",
  verbose: false,
};

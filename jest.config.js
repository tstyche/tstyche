/** @type {import("jest").Config} */
const config = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*"],
  coverageDirectory: "./coverage/unit",
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  injectGlobals: false,
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  moduleNameMapper: {
    ["^#(.*)$"]: "<rootDir>/src/$1",
    ["^(\\.{1,2}/.*)\\.js$"]: "$1",
  },
  // TODO remove after fixing https://github.com/jestjs/jest/issues/14305
  prettierPath: null,
  randomize: true,
  testMatch: ["**/*.test.ts?(x)", "!**/examples/**/*", "!**/typetests/**/*"],
  testTimeout: 75000,
  transform: {
    ["\\.tsx?$"]: "./scripts/jest-ts-transformer.js",
  },
  workerThreads: true,
};

export default config;

/** @type {import("jest").Config} */
const config = {
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  injectGlobals: false,
  moduleNameMapper: {
    ["^#(.*)$"]: "<rootDir>/source/$1",
    ["^(\\.{1,2}/.*)\\.js$"]: "$1",
  },
  modulePathIgnorePatterns: ["\\.generated"],
  randomize: true,
  testTimeout: 75000,
  transform: {
    ["\\.tsx?$"]: "./tests/__scripts__/jest-ts-transformer.js",
  },
  workerThreads: true,
};

export default config;

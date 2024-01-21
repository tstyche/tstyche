/** @type {import("jest").Config} */
const config = {
  clearMocks: true,
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  injectGlobals: false,
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  moduleNameMapper: {
    ["^#(.*)$"]: "<rootDir>/source/$1",
    ["^(\\.{1,2}/.*)\\.js$"]: "$1",
  },
  randomize: true,
  testTimeout: 75000,
  transform: {
    ["\\.tsx?$"]: "./tests/__scripts__/jest-ts-transformer.js",
  },
  workerThreads: true,
};

export default config;

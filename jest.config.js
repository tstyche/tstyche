/** @type {import("jest").Config} */
const config = {
  injectGlobals: false,
  randomize: true,
  testMatch: ["**/tests/*.test.js"],
  testTimeout: 75000,
  workerThreads: true,
};

export default config;

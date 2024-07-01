import { CoverageReport } from "monocart-coverage-reports";

const coverageReport = new CoverageReport({
  inputDir: ["./coverage/raw-coverage-linux", "./coverage/raw-coverage-macos", "./coverage/raw-coverage-windows"],
  outputDir: "./coverage",

  all: "./source",

  clean: true,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,

    "**/build/bin.js": true,
    "**/build/tstyche.js": true,
  },

  sourceFilter: {
    "**/source/*.ts": true,
    "**/source/*/*.ts": true,
    "**/source/*/*.tsx": true,
  },

  reports: [["codacy", { outputFile: "codacy-coverage.json" }], "console-summary"],
});

await coverageReport.generate();

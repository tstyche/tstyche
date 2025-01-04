// biome-ignore lint/correctness/noUndeclaredDependencies : biome can't see mocha in this module's package.json?
import type * as M from "mocha";
import * as path from "node:path";
import * as process from "node:process";
import * as util from "node:util";
import type { CommandLineOptions } from "../source/config/index.js";
import { Config } from "../source/config/index.js";
import { Runner } from "../source/runner/index.js";
import { Select } from "../source/select/index.js";
import { MochaReporter } from "./MochaReporter.js";

const {
  values: { config: configArg, grep, help, reporter: reporterArg },
  positionals,
} = util.parseArgs({
  allowPositionals: true,
  options: {
    /**
     * This is from mocha.  Matching in tstyche doesn't use patterns,
     * it's just strings, but it will work for very simple "run this
     * describe block" use-cases.
     */
    grep: {
      type: "string",
    },
    /**
     * This is neither mocha, tstyche, nor IJ.  It's just trying to be helpful.
     */
    help: {
      type: "boolean",
      short: "h",
    },
    /**
     * This is for tstyche.  (Though it is also a standard mocha option.)
     */
    config: {
      type: "string",
    },
    /**
     * This is from mocha, but tstyche has no equivalent.
     */
    recursive: {
      type: "boolean",
    },
    /**
     * This is standard for mocha.
     * See {@link https://mochajs.org/#command-line-usage | mochajs.org}.
     */
    reporter: {
      short: "R",
      type: "string",
    },
    /**
     * This is standard for mocha.
     * See {@link https://mochajs.org/#command-line-usage | mochajs.org}.
     */
    timeout: {
      short: "t",
      type: "string",
    },
    /**
     * This is standard for mocha.
     * See {@link https://mochajs.org/#command-line-usage | mochajs.org}.
     */
    ui: {
      default: "bdd",
      type: "string",
    },
  },
});

if (help) {
  process.stdout.write(
    `
This shim uses only a small subset of mocha CLI options.
Params:
  --reporter path    Path to the reporter JS used by the IDE.
  --config path      Path to tstyche.config.json (not mocha!)
  `.trim(),
    "utf-8",
  );
  process.exit(1);
}

if (reporterArg == null) {
  process.stdout.write("--reporter|-R (path/to/js) is required\n", "utf-8");
  process.exit(1);
}

const run = async () => {
  const reporterModule = (await import(reporterArg)).default as unknown;
  if (typeof reporterModule !== "function") {
    throw new Error(`Imported reporter does not have a default export: ${reporterArg}`);
  }
  const fn = reporterModule as (runner: M.Runner) => void;
  const configOptions = await Config.parseConfigFile(configArg);
  const commandLineOptions: CommandLineOptions = {};
  if (grep != null && grep !== "") {
    // tstyche doesn't support patterns, which IJ tries to add by default.
    // Strip it down to support just a substring match.  Won't handle multiple
    // values!
    commandLineOptions.only = grep.replace(/^\^|\$$/g, "");
  }
  let pathMatch: Array<string> | undefined ;
  if (positionals != null && positionals.length > 0) {
    const cwd = process.cwd();
    // tystche matchers don't expand relative paths to absolute,
    // so we need to match.
    pathMatch = positionals.map((p) => path.relative(cwd, p));
  }
  const resolvedConfig = Config.resolve({
    ...configOptions,
    commandLineOptions,
    ...(pathMatch == null ? {} : { pathMatch }),
  });
  // Clear out the default Line and Summary reporters.
  resolvedConfig.reporters = [];
  const testFiles = await Select.selectFiles(resolvedConfig);
  const runner = new Runner(resolvedConfig);
  // Add in the shim.
  const reporter = new MochaReporter(resolvedConfig, fn);
  runner.addReporter(reporter);
  // Ready?  Goooooo!!!!
  await runner.run(testFiles);
};

run().catch((err: unknown) => {
  // biome-ignore lint/suspicious/noConsole : It's an error logger.  Why reinvent that?
  console.error(err);
  process.exit(1);
});

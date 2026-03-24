import { Cli } from "./api.js";

/**
 * Runs TSTyche in the same process, streaming error messages and test results to the `stderr` and `stdout` in real-time.
 *
 * @returns A promise that resolves if the test run is successful and rejects if it fails.
 */

export default async function tstyche(template: TemplateStringsArray, ...substitutions: Array<string>): Promise<void> {
  const cli = new Cli();
  const commandLine = String.raw(template, ...substitutions).split(/\s+/);

  const exitCode = await cli.run(commandLine);

  if (exitCode > 0) {
    throw new Error("TSTyche test run failed. Check the output above for details.");
  }
}

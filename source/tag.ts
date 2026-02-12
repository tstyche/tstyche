import { CancellationToken, Cli, DiagnosticCategory, type Event, EventEmitter, type EventHandler } from "./tstyche.js";

class StatusHandler implements EventHandler {
  #hasError = false;

  hasError(): boolean {
    return this.#hasError;
  }

  on([event, payload]: Event): void {
    if (event === "run:start") {
      // useful when tests are reran in watch mode
      this.#hasError = false;
      return;
    }

    if ("diagnostics" in payload) {
      if (payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
        this.#hasError = true;
      }
    }
  }
}

/**
 * Runs TSTyche in the same process, streaming error messages and test results to the `stderr` and `stdout` in real-time.
 *
 * @returns A promise that resolves if the test run is successful and rejects if it fails.
 */

export default async function tstyche(template: TemplateStringsArray, ...substitutions: Array<string>): Promise<void> {
  const cli = new Cli({ noErrorExitCode: true });
  const commandLine = String.raw(template, ...substitutions).split(/\s+/);
  const eventEmitter = new EventEmitter();
  const statusHandler = new StatusHandler();

  eventEmitter.addHandler(statusHandler);

  await cli.run(commandLine, new CancellationToken());

  eventEmitter.removeHandler(statusHandler);

  if (statusHandler.hasError()) {
    throw new Error("TSTyche test run failed. Check the output above for details.");
  }
}

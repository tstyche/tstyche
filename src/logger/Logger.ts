import process from "node:process";
import type { Writable } from "node:stream";
import { Environment } from "#environment";
import { Scribbler } from "#scribbler";

/**
 * Options to configure an instance of the {@link Logger}.
 */
export interface LoggerOptions {
  /**
   * Specifies whether color should be disabled in the output. Default: `Environment.noColor`.
   */
  noColor?: boolean;
  /**
   * A stream to write warnings and errors. Default: `process.stdout`.
   */
  stderr?: Writable;
  /**
   * A stream to write informational messages. Default: `process.stderr`.
   */
  stdout?: Writable;
}

/**
 * Wraps the provided streams with a set of convenience methods.
 */
export class Logger {
  #noColor: boolean;
  #scribbler: Scribbler;
  #stderr: Writable;
  #stdout: Writable;

  /**
   * @param options - {@link LoggerOptions | Options} to configure an instance of the Logger.
   */
  constructor(options?: LoggerOptions) {
    this.#noColor = options?.noColor ?? Environment.noColor;
    this.#stderr = options?.stderr ?? process.stderr;
    this.#stdout = options?.stdout ?? process.stdout;

    this.#scribbler = new Scribbler({ noColor: this.#noColor });
  }

  /**
   * Moves the cursor one line up in the `stdout` stream and erases that line.
   */
  eraseLastLine(): void {
    this.#stdout.write("\u001B[1A\u001B[0K");
  }

  #write(stream: Writable, body: JSX.Element | Array<JSX.Element>): void {
    const elements = Array.isArray(body) ? body : [body];

    for (const element of elements) {
      if (element.$$typeof !== Symbol.for("tstyche:scribbler")) {
        return;
      }

      stream.write(this.#scribbler.render(element));
    }
  }

  writeError(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stderr, body);
  }

  writeMessage(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stdout, body);
  }

  writeWarning(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stderr, body);
  }
}

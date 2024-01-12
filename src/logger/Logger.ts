import process from "node:process";
import { Environment } from "#environment";
import { Scribbler } from "#scribbler";

/**
 * A stream to output messages.
 */
export interface WriteStream {
  /**
   * @param chunk - Data to write.
   */
  write: (chunk: string) => void;
}

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
  stderr?: WriteStream;
  /**
   * A stream to write informational messages. Default: `process.stderr`.
   */
  stdout?: WriteStream;
}

/**
 * Wraps the provided streams with a set of convenience methods.
 */
export class Logger {
  #noColor: boolean;
  #scribbler: Scribbler;
  #stderr: WriteStream;
  #stdout: WriteStream;

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

  #write(stream: WriteStream, body: JSX.Element | Array<JSX.Element>): void {
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

  // TODO rename 'writeOutput'
  writeMessage(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stdout, body);
  }
}

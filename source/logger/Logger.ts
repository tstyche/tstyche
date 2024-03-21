import process from "node:process";
import { Environment } from "#environment";
import { Scribbler } from "#scribbler";

export interface WriteStream {
  write: (log: string) => void;
}

export interface LoggerOptions {
  noColor?: boolean;
  stderr?: WriteStream;
  stdout?: WriteStream;
}

export class Logger {
  #noColor: boolean;
  #scribbler: Scribbler;
  #stderr: WriteStream;
  #stdout: WriteStream;

  constructor(options?: LoggerOptions) {
    this.#noColor = options?.noColor ?? Environment.noColor;
    this.#stderr = options?.stderr ?? process.stderr;
    this.#stdout = options?.stdout ?? process.stdout;

    this.#scribbler = new Scribbler({ noColor: this.#noColor });
  }

  clear(): void {
    // Erases all visible output, clears all lines saved in the scroll-back buffer
    // and moves the cursor to the upper left corner.
    this.#stdout.write("\u001B[2J\u001B[3J\u001B[H");
  }

  eraseLastLine(): void {
    // Moves the cursor one line up and erases that line.
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

  writeMessage(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stdout, body);
  }

  writeWarning(body: JSX.Element | Array<JSX.Element>): void {
    this.#write(this.#stderr, body);
  }
}

import process from "node:process";
import { Environment } from "#environment";
import { Scribbler, type ScribblerJsx } from "#scribbler";

export interface WriteStream {
  write: (chunk: string) => void;
}

export interface OutputServiceOptions {
  noColor?: boolean;
  stderr?: WriteStream;
  stdout?: WriteStream;
}

export class OutputService {
  #isClear = false;
  #noColor: boolean;
  #scribbler: Scribbler;
  #stderr: WriteStream;
  #stdout: WriteStream;

  constructor(options?: OutputServiceOptions) {
    this.#noColor = options?.noColor ?? Environment.noColor;
    this.#stderr = options?.stderr ?? process.stderr;
    this.#stdout = options?.stdout ?? process.stdout;

    this.#scribbler = new Scribbler({ noColor: this.#noColor });
  }

  clearTerminal(): void {
    if (!this.#isClear) {
      // Erases all visible output, clears all lines saved in the scroll-back buffer
      // and moves the cursor to the upper left corner.
      this.#stdout.write("\u001B[2J\u001B[3J\u001B[H");
      this.#isClear = true;
    }
  }

  eraseLastLine(): void {
    // Moves the cursor one line up and erases that line.
    this.#stdout.write("\u001B[1A\u001B[0K");
  }

  #writeTo(stream: WriteStream, element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    const elements = Array.isArray(element) ? element : [element];

    for (const element of elements) {
      stream.write(this.#scribbler.render(element));
    }

    this.#isClear = false;
  }

  writeError(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    this.#writeTo(this.#stderr, element);
  }

  writeMessage(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    this.#writeTo(this.#stdout, element);
  }

  writeWarning(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    this.#writeTo(this.#stderr, element);
  }
}

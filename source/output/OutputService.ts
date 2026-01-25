import process from "node:process";
import { Scribbler, type ScribblerJsx } from "#scribbler";
import { StreamController } from "./StreamController.js";

export class OutputService {
  static errorStream = new StreamController(process.stderr);
  static outputStream = new StreamController(process.stdout);

  static #isClear = false;
  static #scribbler = new Scribbler();

  static clearTerminal(): void {
    if (!OutputService.#isClear) {
      // Erases all visible output, clears all lines saved in the scroll-back buffer
      // and moves the cursor to the upper left corner.
      OutputService.outputStream.write("\u001B[2J\u001B[3J\u001B[H");
      OutputService.#isClear = true;
    }
  }

  static eraseLastLine(): void {
    // Moves the cursor one line up and erases that line.
    OutputService.outputStream.write("\u001B[1A\u001B[0K");
  }

  static #writeTo(stream: StreamController, element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    const elements = Array.isArray(element) ? element : [element];

    for (const element of elements) {
      stream.write(OutputService.#scribbler.render(element));
    }

    OutputService.#isClear = false;
  }

  static writeError(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    OutputService.#writeTo(OutputService.errorStream, element);
  }

  static writeMessage(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    OutputService.#writeTo(OutputService.outputStream, element);
  }

  static writeWarning(element: ScribblerJsx.Element | Array<ScribblerJsx.Element>): void {
    OutputService.#writeTo(OutputService.errorStream, element);
  }
}

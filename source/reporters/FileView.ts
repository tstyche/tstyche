import { describeNameText, fileViewText, testNameText } from "#output";
import type { ScribblerJsx } from "#scribbler";

export class FileView {
  #indent = 0;
  #lines: Array<ScribblerJsx.Element> = [];
  #messages: Array<ScribblerJsx.Element> = [];

  get hasErrors(): boolean {
    return this.#messages.length > 0;
  }

  addMessage(message: ScribblerJsx.Element): void {
    this.#messages.push(message);
  }

  addTest(status: "fail" | "pass" | "skip" | "todo", name: string): void {
    this.#lines.push(testNameText(status, name, this.#indent));
  }

  beginDescribe(name: string): void {
    this.#lines.push(describeNameText(name, this.#indent));
    this.#indent++;
  }

  clear(): void {
    this.#indent = 0;
    this.#lines = [];
    this.#messages = [];
  }

  endDescribe(): void {
    this.#indent--;
  }

  getMessages(): Array<ScribblerJsx.Element> {
    return this.#messages;
  }

  getViewText(options?: { appendEmptyLine: boolean }): ScribblerJsx.Element {
    return fileViewText(this.#lines, options?.appendEmptyLine === true || this.hasErrors);
  }
}

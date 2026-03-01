import { describeNameText, testNameText } from "#output";
import type { ResultStatus, TestResultStatus } from "#result";
import type { ScribblerJsx } from "#scribbler";

export class FileView {
  #indent = 0;
  #lines: Array<ScribblerJsx.Element> = [];
  #messages: Array<ScribblerJsx.Element> = [];

  addMessage(message: ScribblerJsx.Element): void {
    this.#messages.push(message);
  }

  addTest(status: Exclude<TestResultStatus, ResultStatus.Runs>, name: string): void {
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

  getView(): Array<ScribblerJsx.Element> {
    return this.#lines;
  }

  hasErrors(): boolean {
    return this.#messages.length > 0;
  }
}

import { describeNameText, fileViewText, testNameText } from "#output";

export class FileViewService {
  #indent = 0;
  #lines: Array<JSX.Element> = [];
  #messages: Array<JSX.Element> = [];

  get hasErrors(): boolean {
    return this.#messages.length > 0;
  }

  addMessage(message: JSX.Element): void {
    this.#messages.push(message);
  }

  addTest(status: "fail" | "pass" | "skip" | "todo", name: string): void {
    this.#lines.push(testNameText(status, name, this.#indent));
  }

  beginDescribe(name: string): void {
    this.#lines.push(describeNameText(name, this.#indent));
    this.#indent++;
  }

  endDescribe(): void {
    this.#indent--;
  }

  getMessages(): Array<JSX.Element> {
    return this.#messages;
  }

  getViewText(options?: { appendEmptyLine: boolean }): JSX.Element {
    return fileViewText(this.#lines, options?.appendEmptyLine === true || this.hasErrors);
  }

  reset(): void {
    this.#indent = 0;
    this.#lines = [];
    this.#messages = [];
  }
}

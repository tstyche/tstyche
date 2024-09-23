import { DiagnosticOrigin, type SourceFile } from "#diagnostic";
import type { OptionValue } from "./OptionDefinitionsMap.js";

export class JsonElement {
  origin: DiagnosticOrigin;
  text: string | undefined;
  value: OptionValue;

  constructor(text: string | undefined, origin: DiagnosticOrigin) {
    this.origin = origin;
    this.text = text;

    this.value = this.#resolveValue();
  }

  #resolveValue() {
    if (this.text == null) {
      return undefined;
    }

    if (/^['"]/.test(this.text)) {
      return this.text.slice(1, -1);
    }

    if (this.text === "true") {
      return true;
    }

    if (this.text === "false") {
      return false;
    }

    if (/^\d/.test(this.text)) {
      return Number.parseFloat(this.text);
    }

    return this.text;
  }
}

export class JsonScanner {
  #currentPosition = 0;
  #previousPosition = 0;
  #sourceFile: SourceFile;

  constructor(sourceFile: SourceFile) {
    this.#sourceFile = sourceFile;
  }

  #getOrigin() {
    return new DiagnosticOrigin(this.#previousPosition, this.#currentPosition, this.#sourceFile);
  }

  isRead() {
    return !(this.#currentPosition < this.#sourceFile.text.length);
  }

  #peekCharacter() {
    return this.#sourceFile.text.charAt(this.#currentPosition);
  }

  #peekNextCharacter() {
    return this.#sourceFile.text.charAt(this.#currentPosition + 1);
  }

  peekToken(token: string) {
    this.#skipTrivia();

    return this.#peekCharacter() === token;
  }

  read(): JsonElement {
    this.#skipTrivia();

    if (/[\:\]}]/.test(this.#peekCharacter())) {
      return new JsonElement(undefined, this.#getOrigin());
    }

    let quoteCharacter = "";
    let text = "";

    this.#previousPosition = this.#currentPosition;

    if (/['"]/.test(this.#peekCharacter())) {
      quoteCharacter = text += this.#readCharacter();
    }

    while (this.#currentPosition < this.#sourceFile.text.length) {
      if (
        this.#peekCharacter() === quoteCharacter ||
        (!quoteCharacter && /[\s,:\]}]/.test(this.#peekNextCharacter()))
      ) {
        text += this.#readCharacter();

        break;
      }

      text += this.#readCharacter();
    }

    return new JsonElement(text, this.#getOrigin());
  }

  #readCharacter() {
    return this.#sourceFile.text.charAt(this.#currentPosition++);
  }

  readToken(token: string): JsonElement {
    this.#skipTrivia();

    this.#previousPosition = this.#currentPosition;

    if (this.#peekCharacter() === token) {
      this.#currentPosition++;

      return new JsonElement(token, this.#getOrigin());
    }

    return new JsonElement(undefined, this.#getOrigin());
  }

  #skipTrivia() {
    while (this.#currentPosition < this.#sourceFile.text.length) {
      if (/\s/.test(this.#peekCharacter())) {
        this.#currentPosition++;
        continue;
      }

      if (this.#peekCharacter() === "/") {
        if (this.#peekNextCharacter() === "/") {
          this.#currentPosition += 2;

          while (this.#currentPosition < this.#sourceFile.text.length) {
            if (this.#readCharacter() === "\n") {
              break;
            }
          }

          continue;
        }

        if (this.#peekNextCharacter() === "*") {
          this.#currentPosition += 2;

          while (this.#currentPosition < this.#sourceFile.text.length) {
            if (this.#peekCharacter() === "*" && this.#peekNextCharacter() === "/") {
              this.#currentPosition += 2;
              break;
            }
            this.#currentPosition++;
          }

          continue;
        }
      }

      // makes sure white space after comments is skipped
      break;
    }

    this.#previousPosition = this.#currentPosition;
  }
}

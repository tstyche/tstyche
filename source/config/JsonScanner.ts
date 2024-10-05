import { DiagnosticOrigin, type SourceFile } from "#diagnostic";
import { JsonNode } from "./JsonNode.js";

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

  read(): JsonNode {
    this.#skipTrivia();

    this.#previousPosition = this.#currentPosition;

    if (/[\s,:\]}]/.test(this.#peekCharacter())) {
      return new JsonNode(undefined, this.#getOrigin());
    }

    let text = "";
    let closingTokenText = "";

    if (/[[{'"]/.test(this.#peekCharacter())) {
      text += this.#readCharacter();

      switch (text) {
        case "[":
          closingTokenText = "]";
          break;

        case "{":
          closingTokenText = "}";
          break;

        default:
          closingTokenText = text;
      }
    }

    while (!this.isRead()) {
      text += this.#readCharacter();

      if (text.slice(-1) === closingTokenText || (!closingTokenText && /[\s,:\]}]/.test(this.#peekCharacter()))) {
        break;
      }
    }

    return new JsonNode(text, this.#getOrigin());
  }

  #readCharacter() {
    return this.#sourceFile.text.charAt(this.#currentPosition++);
  }

  readToken(token: string): JsonNode {
    this.#skipTrivia();

    this.#previousPosition = this.#currentPosition;

    if (this.#peekCharacter() === token) {
      this.#currentPosition++;

      return new JsonNode(token, this.#getOrigin());
    }

    return new JsonNode(undefined, this.#getOrigin());
  }

  #skipTrivia() {
    while (!this.isRead()) {
      if (/\s/.test(this.#peekCharacter())) {
        this.#currentPosition++;
        continue;
      }

      if (this.#peekCharacter() === "/") {
        if (this.#peekNextCharacter() === "/") {
          this.#currentPosition += 2;

          while (!this.isRead()) {
            if (this.#readCharacter() === "\n") {
              break;
            }
          }

          continue;
        }

        if (this.#peekNextCharacter() === "*") {
          this.#currentPosition += 2;

          while (!this.isRead()) {
            if (this.#peekCharacter() === "*" && this.#peekNextCharacter() === "/") {
              this.#currentPosition += 2;
              break;
            }
            this.#currentPosition++;
          }

          continue;
        }
      }

      break;
    }

    this.#previousPosition = this.#currentPosition;
  }
}

import type ts from "typescript";
import { DiagnosticOrigin } from "#diagnostic";
import type { SourceFile } from "#source";
import { JsonNode } from "./JsonNode.js";

export interface JsonScannerOptions {
  start?: number;
  end?: number;
}

export class JsonScanner {
  #end: number;
  #position: number;
  #previousPosition: number;
  #sourceFile: SourceFile | ts.SourceFile;

  constructor(sourceFile: SourceFile | ts.SourceFile, options?: JsonScannerOptions) {
    this.#end = options?.end ?? sourceFile.text.length;
    this.#position = options?.start ?? 0;
    this.#previousPosition = options?.start ?? 0;
    this.#sourceFile = sourceFile;
  }

  #getOrigin() {
    return new DiagnosticOrigin(this.#previousPosition, this.#position, this.#sourceFile);
  }

  isRead(): boolean {
    return !(this.#position < this.#end);
  }

  #peekCharacter() {
    return this.#sourceFile.text.charAt(this.#position);
  }

  #peekNextCharacter() {
    return this.#sourceFile.text.charAt(this.#position + 1);
  }

  peekToken(token: string): boolean {
    this.#skipTrivia();

    return this.#peekCharacter() === token;
  }

  read(): JsonNode {
    this.#skipTrivia();

    this.#previousPosition = this.#position;

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
    return this.#sourceFile.text.charAt(this.#position++);
  }

  readToken(token: string | RegExp): JsonNode {
    this.#skipTrivia();

    this.#previousPosition = this.#position;

    const character = this.#peekCharacter();

    if (typeof token === "string" ? token === character : token.test(character)) {
      this.#position++;

      return new JsonNode(character, this.#getOrigin());
    }

    return new JsonNode(undefined, this.#getOrigin());
  }

  #skipTrivia() {
    while (!this.isRead()) {
      if (/\s/.test(this.#peekCharacter())) {
        this.#position++;
        continue;
      }

      if (this.#peekCharacter() === "/") {
        if (this.#peekNextCharacter() === "/") {
          this.#position += 2;

          while (!this.isRead()) {
            if (this.#readCharacter() === "\n") {
              break;
            }
          }

          continue;
        }

        if (this.#peekNextCharacter() === "*") {
          this.#position += 2;

          while (!this.isRead()) {
            if (this.#peekCharacter() === "*" && this.#peekNextCharacter() === "/") {
              this.#position += 2;
              break;
            }
            this.#position++;
          }

          continue;
        }
      }

      break;
    }

    this.#previousPosition = this.#position;
  }
}

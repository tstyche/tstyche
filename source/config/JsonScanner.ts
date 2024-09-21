import { DiagnosticOrigin, type SourceFile } from "#diagnostic";

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

  read(): { origin: DiagnosticOrigin; text: string | undefined } {
    this.#skipTrivia();

    if (/[\]}]/.test(this.#peekCharacter())) {
      return { origin: this.#getOrigin(), text: undefined };
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

    return { origin: this.#getOrigin(), text };
  }

  #readCharacter() {
    return this.#sourceFile.text.charAt(this.#currentPosition++);
  }

  readToken(token: string): { origin: DiagnosticOrigin; value: string | undefined } {
    this.#skipTrivia();

    this.#previousPosition = this.#currentPosition;

    if (this.#peekCharacter() === token) {
      this.#currentPosition++;

      return { origin: this.#getOrigin(), value: token };
    }

    return { origin: this.#getOrigin(), value: undefined };
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
  }
}

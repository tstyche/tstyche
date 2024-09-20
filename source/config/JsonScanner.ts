import { DiagnosticOrigin, SourceFile } from "#diagnostic";

export class JsonScanner {
  #currentPosition = 0;
  #filePath = "";
  #previousPosition = 0;
  #text = "";

  #getOrigin() {
    return new DiagnosticOrigin(
      this.#previousPosition,
      this.#currentPosition,
      new SourceFile(this.#filePath, this.#text),
    );
  }

  isRead() {
    return !(this.#currentPosition < this.#text.length);
  }

  #peekCharacter() {
    return this.#text.charAt(this.#currentPosition);
  }

  #peekNextCharacter() {
    return this.#text.charAt(this.#currentPosition + 1);
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

    while (this.#currentPosition < this.#text.length) {
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
    return this.#text.charAt(this.#currentPosition++);
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

  setText(text: string, filePath: string) {
    this.#text = text;
    this.#filePath = filePath;
  }

  #skipTrivia() {
    while (this.#currentPosition < this.#text.length) {
      if (/\s/.test(this.#peekCharacter())) {
        this.#currentPosition++;
        continue;
      }

      if (this.#peekCharacter() === "/") {
        if (this.#peekNextCharacter() === "/") {
          this.#currentPosition += 2;

          while (this.#currentPosition < this.#text.length) {
            if (this.#readCharacter() === "\n") {
              break;
            }
          }

          continue;
        }

        if (this.#peekNextCharacter() === "*") {
          this.#currentPosition += 2;

          while (this.#currentPosition < this.#text.length) {
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

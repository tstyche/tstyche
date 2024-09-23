import type { DiagnosticOrigin } from "#diagnostic";
import type { OptionValue } from "./types.js";

export class JsonElement {
  origin: DiagnosticOrigin;
  text: string | undefined;

  constructor(text: string | undefined, origin: DiagnosticOrigin) {
    this.origin = origin;
    this.text = text;
  }

  getValue(options: { expectsIdentifier: true }): string | undefined;
  getValue(options: { expectsString: true }): string | undefined;
  getValue(): OptionValue;
  getValue(options?: { expectsIdentifier?: boolean; expectsString?: boolean }): OptionValue {
    if (this.text == null) {
      return undefined;
    }

    if (/^['"]/.test(this.text)) {
      return this.text.slice(1, -1);
    }

    if (!options?.expectsIdentifier) {
      if (this.text === "true") {
        return true;
      }

      if (this.text === "false") {
        return false;
      }

      if (/^\d/.test(this.text)) {
        return Number.parseFloat(this.text);
      }
    }

    if (!options?.expectsString) {
      return this.text;
    }

    return undefined;
  }
}

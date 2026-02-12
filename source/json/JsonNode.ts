import type { DiagnosticOrigin } from "#diagnostic";
import type { OptionValue } from "./types.js";

export class JsonNode {
  origin: DiagnosticOrigin;
  text: string | undefined;

  constructor(text: string | undefined, origin: DiagnosticOrigin) {
    this.origin = origin;
    this.text = text;
  }

  getValue(options: { expectsIdentifier: true }): string | undefined;
  getValue(): OptionValue;
  getValue(options?: { expectsIdentifier?: boolean }): OptionValue {
    if (this.text == null) {
      return undefined;
    }

    if (/^['"]/.test(this.text)) {
      return this.text.slice(1, -1).replaceAll("\\", "");
    }

    if (options?.expectsIdentifier) {
      return this.text;
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

    return undefined;
  }
}

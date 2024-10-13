import { environmentOptions } from "#config";
import type { ScribblerJsx, ScribblerNode } from "./types.js";

export interface ScribblerOptions {
  newLine?: string;
  noColor?: boolean;
}

export class Scribbler {
  #indentStep = "  ";
  #newLine: string;
  #noColor: boolean;
  #notEmptyLineRegex = /^(?!$)/gm;

  constructor(options?: ScribblerOptions) {
    this.#newLine = options?.newLine ?? "\n";
    this.#noColor = options?.noColor ?? environmentOptions.noColor;
  }

  #escapeSequence(attributes: string | Array<string>): string {
    return ["\u001B[", Array.isArray(attributes) ? attributes.join(";") : attributes, "m"].join("");
  }

  #indentEachLine(lines: string, level: number) {
    if (level === 0) {
      return lines;
    }

    return lines.replace(this.#notEmptyLineRegex, this.#indentStep.repeat(level));
  }

  render(element: ScribblerJsx.Element): string {
    if (typeof element.type === "function") {
      return this.render(element.type({ ...element.props }));
    }

    if (element.type === "ansi" && !this.#noColor) {
      return this.#escapeSequence((element.props as ScribblerJsx.IntrinsicElements["ansi"]).escapes);
    }

    if (element.type === "newLine") {
      return this.#newLine;
    }

    if (element.type === "text") {
      const text = this.#visitChildren((element.props as ScribblerJsx.IntrinsicElements["text"]).children);

      return this.#indentEachLine(text, (element.props as ScribblerJsx.IntrinsicElements["text"]).indent);
    }

    return "";
  }

  #visitChildren(children: Array<ScribblerNode>) {
    const text: Array<string | number> = [];

    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") {
        text.push(child);
        continue;
      }

      if (Array.isArray(child)) {
        text.push(this.#visitChildren(child));
        continue;
      }

      if (child != null && typeof child === "object") {
        text.push(this.render(child));
      }
    }

    return text.join("");
  }
}

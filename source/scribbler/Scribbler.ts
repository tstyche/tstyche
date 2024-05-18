import type { ElementChildren, ScribblerJsx } from "./types.js";

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
    this.#noColor = options?.noColor ?? false;
  }

  #escapeSequence(attributes: string | Array<string>): string {
    return ["\u001B[", Array.isArray(attributes) ? attributes.join(";") : attributes, "m"].join("");
  }

  #indentEachLine(lines: string, level: number) {
    return lines.replace(this.#notEmptyLineRegex, this.#indentStep.repeat(level));
  }

  render(element: ScribblerJsx.Element): string {
    if (typeof element.type === "function") {
      const instance = new element.type({ ...element.props });

      return this.render(instance.render());
    }

    if (element.type === "ansi" && !this.#noColor) {
      return this.#escapeSequence((element.props as ScribblerJsx.IntrinsicElements["ansi"]).escapes);
    }

    if (element.type === "newLine") {
      return this.#newLine;
    }

    if (element.type === "text") {
      const { children, indent } = element.props as ScribblerJsx.IntrinsicElements["text"];

      let text = this.#visitChildren(children);

      if (indent != null) {
        text = this.#indentEachLine(text, indent);
      }

      return text;
    }

    return "";
  }

  #visitChildren(children: Array<ElementChildren>) {
    const text: Array<string> = [];

    for (const child of children) {
      if (typeof child === "string") {
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

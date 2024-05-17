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
      const flags =
        typeof element.props?.["escapes"] === "string" || Array.isArray(element.props?.["escapes"])
          ? element.props["escapes"]
          : undefined;

      if (flags != null) {
        return this.#escapeSequence(flags);
      }
    }

    if (element.type === "newLine") {
      return this.#newLine;
    }

    if (element.type === "text") {
      const indentLevel = typeof element.props?.["indent"] === "number" ? element.props["indent"] : 0;

      let text = this.#visitElementChildren(element.props["children"] as ElementChildren);

      if (indentLevel > 0) {
        text = this.#indentEachLine(text, indentLevel);
      }

      return text;
    }

    return "";
  }

  #visitElementChildren(children: ElementChildren) {
    if (typeof children === "string") {
      return children;
    }

    if (Array.isArray(children)) {
      const text: Array<string> = [];

      for (const child of children) {
        if (typeof child === "string") {
          text.push(child);
          continue;
        }

        if (Array.isArray(child)) {
          text.push(this.#visitElementChildren(child));
          continue;
        }

        if (child != null && typeof child === "object") {
          text.push(this.render(child));
        }
      }

      return text.join("");
    }

    if (children != null && typeof children === "object") {
      return this.render(children);
    }

    return "";
  }
}

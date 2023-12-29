import type { Color } from "./Color.js";

type ElementChildren = Array<ElementChildren> | JSX.Element | string | undefined;

type ComponentConstructor = new (props: Record<string, unknown>) => JSX.ElementClass;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Element {
      $$typeof: symbol;
      children: ElementChildren;
      props: Record<string, unknown> | null;
      type: ComponentConstructor | string;
    }
    interface ElementAttributesProperty {
      props: Record<string, unknown> | null;
    }
    interface ElementClass {
      render: () => JSX.Element | null;
    }
    interface ElementChildrenAttribute {
      children: ElementChildren;
    }
    interface IntrinsicElements {
      ansi: {
        children?: never;
        escapes: Color | Array<Color>;
      };
      newline: {
        children?: never;
      };
      text: {
        children: ElementChildren;
        indent?: number | undefined;
      };
    }
  }
}

/**
 * Options to configure an instance of the {@link Scribbler}.
 */
export interface ScribblerOptions {
  /**
   * Do not include ANSI color escape codes in the output. Default: `false`.
   */
  noColors?: boolean;
}

/**
 * Provides the JSX factory function and renderer.
 */
export class Scribbler {
  #noColor: boolean;

  /**
   * @param options - {@link ScribblerOptions | Options} to configure an instance of the Scribbler.
   */
  constructor(options?: ScribblerOptions) {
    this.#noColor = options?.noColors ?? false;
  }

  /**
   * Creates a new text element of the given `type`.
   */
  static createElement(
    type: ComponentConstructor | string,
    props: Record<string, unknown> | null,
    ...children: Array<ElementChildren>
  ): JSX.Element {
    return {
      $$typeof: Symbol.for("tstyche:scribbler"),
      children: children.length > 1 ? children : children[0],
      props,
      type,
    };
  }

  #escapeSequence(attributes: string | Array<string>): string {
    return ["\x1b[", Array.isArray(attributes) ? attributes.join(";") : attributes, "m"].join("");
  }

  #indentEachLine(lines: string, level: number) {
    const indentStep = "  ";
    const notEmptyLineRegExp = /^(?!$)/gm;

    return lines.replaceAll(notEmptyLineRegExp, indentStep.repeat(level));
  }

  /**
   * Renders the provided JSX `element` and returns the resulting string.
   */
  render(element: JSX.Element | null): string {
    if (element != null) {
      if (typeof element.type === "function") {
        const instance = new element.type({
          ...element.props,
          children: element.children,
        });

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

      if (element.type === "newline") {
        return "\r\n";
      }

      if (element.type === "text") {
        const indentLevel = typeof element.props?.["indent"] === "number" ? element.props["indent"] : 0;

        let text = this.#visitElementChildren(element.children);

        if (indentLevel > 0) {
          text = this.#indentEachLine(text, indentLevel);
        }

        return text;
      }
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
          continue;
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

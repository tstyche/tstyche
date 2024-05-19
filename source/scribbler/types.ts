import type { Color } from "./enums.js";

export type ElementChildren = Array<ElementChildren> | ScribblerJsx.Element | string | undefined;

// biome-ignore lint/correctness/noUnusedVariables: TODO might be false positive
export type ComponentConstructor = new (props: Record<string, unknown>) => ScribblerJsx.ElementClass;

export namespace ScribblerJsx {
  export interface Element {
    props: Record<string, unknown>;
    type: ComponentConstructor | string;
  }
  export interface ElementAttributesProperty {
    props: Record<string, unknown>;
  }
  export interface ElementClass {
    render: () => ScribblerJsx.Element;
  }
  export interface ElementChildrenAttribute {
    children: ElementChildren;
  }
  export interface IntrinsicElements {
    ansi: {
      escapes: Color | Array<Color>;
    };
    newLine: {
      [key: string]: never;
    };
    text: {
      children: Array<ElementChildren>;
      indent: number;
    };
  }
}

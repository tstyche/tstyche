import type { Color } from "./Color.enum.js";

export type ScribblerNode = Array<ScribblerNode> | ScribblerJsx.Element | string | number | undefined;

export type FunctionComponent = (props: Record<string, unknown>) => ScribblerJsx.Element;

export namespace ScribblerJsx {
  export interface Element {
    props: Record<string, unknown>;
    type: FunctionComponent | number | string;
  }
  // TODO remove 'ElementChildrenAttribute' after TypeScript 5.8 is released
  // Reference: https://github.com/microsoft/TypeScript/pull/60880
  export interface ElementChildrenAttribute {
    children: ScribblerNode;
  }
  export interface IntrinsicElements {
    ansi: {
      escapes: Color | Array<Color>;
    };
    newLine: {
      // does not accept props
    };
    text: {
      children: Array<ScribblerNode>;
      indent: number;
    };
  }
}

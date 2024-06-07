import type { Color } from "./enums.js";

export type ScribblerNode = Array<ScribblerNode> | ScribblerJsx.Element | string | undefined;

export type FunctionComponent = (props: Record<string, unknown>) => ScribblerJsx.Element;

export namespace ScribblerJsx {
  export interface Element {
    props: Record<string, unknown>;
    type: FunctionComponent | string;
  }
  export interface ElementChildrenAttribute {
    children: ScribblerNode;
  }
  export interface IntrinsicElements {
    ansi: {
      escapes: Color | Array<Color>;
    };
    newLine: {
      // does not take props
    };
    text: {
      children: Array<ScribblerNode>;
      indent: number;
    };
  }
}

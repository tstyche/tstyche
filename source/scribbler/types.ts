import type { Color } from "./Color.enum.js";

export type ScribblerNode = Array<ScribblerNode> | ScribblerJsx.Element | string | number | undefined;

export type FunctionComponent = (props: Record<string, unknown>) => ScribblerJsx.Element;

export namespace ScribblerJsx {
  export interface Element {
    props: Record<string, unknown>;
    type: FunctionComponent | number | string;
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

import { Color } from "./enums.js";
import type { ScribblerJsx } from "./types.js";

interface TextProps {
  children?: ScribblerJsx.ElementChildrenAttribute["children"];
  color?: Color | undefined;
  indent?: number | undefined;
}

export class Text implements ScribblerJsx.ElementClass {
  constructor(readonly props: TextProps) {}

  render(): ScribblerJsx.Element {
    const ansiEscapes: Array<Color> = [];

    if (this.props.color != null) {
      ansiEscapes.push(this.props.color);
    }

    return (
      <text indent={this.props.indent}>
        {ansiEscapes.length > 0 ? <ansi escapes={ansiEscapes} /> : undefined}
        {this.props.children}
        {ansiEscapes.length > 0 ? <ansi escapes={Color.Reset} /> : undefined}
      </text>
    );
  }
}

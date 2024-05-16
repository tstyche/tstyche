// biome-ignore lint/correctness/noUnusedImports: TODO false positive
import { Scribbler } from "./Scribbler.js";
import { Color } from "./enums.js";

interface TextProps {
  children?: JSX.ElementChildrenAttribute["children"];
  color?: Color | undefined;
  indent?: number | undefined;
}

export class Text implements JSX.ElementClass {
  constructor(readonly props: TextProps) {}

  render(): JSX.Element {
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

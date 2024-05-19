import { Text } from "./Text.js";
import type { Color } from "./enums.js";
import type { ScribblerJsx } from "./types.js";

interface LineProps {
  children?: ScribblerJsx.ElementChildrenAttribute["children"];
  color?: Color;
  indent?: number;
}

export class Line implements ScribblerJsx.ElementClass {
  constructor(readonly props: LineProps) {}

  render(): ScribblerJsx.Element {
    return (
      <Text color={this.props.color} indent={this.props.indent}>
        {this.props.children}
        <newLine />
      </Text>
    );
  }
}

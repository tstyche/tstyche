import { Text } from "./Text.js";
import type { Color } from "./enums.js";

interface LineProps {
  children?: JSX.ElementChildrenAttribute["children"];
  color?: Color;
  indent?: number;
}

export class Line implements JSX.ElementClass {
  constructor(readonly props: LineProps) {}

  render(): JSX.Element {
    return (
      <text>
        <Text color={this.props.color} indent={this.props.indent}>
          {this.props.children}
        </Text>
        <newLine />
      </text>
    );
  }
}

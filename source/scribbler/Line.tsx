import { Text } from "./Text.js";
import type { Color } from "./enums.js";
import type { ScribblerNode } from "./types.js";

interface LineProps {
  children?: ScribblerNode;
  color?: Color;
  indent?: number;
}

export function Line({ children, color, indent }: LineProps) {
  return (
    <Text color={color} indent={indent}>
      {children}
      <newLine />
    </Text>
  );
}

import { Color } from "./Color.enum.js";
import type { ScribblerNode } from "./types.js";

interface TextProps {
  children?: ScribblerNode;
  color?: Color | undefined;
  indent?: number | undefined;
}

export function Text({ children, color, indent }: TextProps) {
  const ansiEscapes: Array<Color> = [];

  if (color != null) {
    ansiEscapes.push(color);
  }

  return (
    <text indent={indent ?? 0}>
      {ansiEscapes.length > 0 ? <ansi escapes={ansiEscapes} /> : undefined}
      {children}
      {ansiEscapes.length > 0 ? <ansi escapes={Color.Reset} /> : undefined}
    </text>
  );
}

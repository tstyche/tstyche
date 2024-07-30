import { Line, type ScribblerJsx } from "#scribbler";

export function describeNameText(name: string, indent = 0): ScribblerJsx.Element {
  return <Line indent={indent + 1}>{name}</Line>;
}

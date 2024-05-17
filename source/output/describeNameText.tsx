import { type JSX, Line } from "#scribbler";

export function describeNameText(name: string, indent = 0): JSX.Element {
  return <Line indent={indent + 1}>{name}</Line>;
}

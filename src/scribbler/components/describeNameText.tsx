import { Scribbler } from "../Scribbler.js";
import { Line } from "./Line.js";

export function describeNameText(name: string, indent = 0): JSX.Element {
  return <Line indent={indent + 1}>{name}</Line>;
}

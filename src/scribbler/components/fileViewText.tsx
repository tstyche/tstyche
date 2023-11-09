import { Scribbler } from "../Scribbler.js";
import { Line } from "./Line.js";
import { Text } from "./Text.js";

export function fileViewText(lines: Array<JSX.Element>, addEmptyFinalLine: boolean): JSX.Element {
  return (
    <Text>
      {[...lines]}
      {addEmptyFinalLine ? <Line /> : undefined}
    </Text>
  );
}

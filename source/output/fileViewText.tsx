import { type JSX, Line, Text } from "#scribbler";

export function fileViewText(lines: Array<JSX.Element>, addEmptyFinalLine: boolean): JSX.Element {
  return (
    <Text>
      {[...lines]}
      {addEmptyFinalLine ? <Line /> : undefined}
    </Text>
  );
}

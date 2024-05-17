import { Line, type ScribblerJsx, Text } from "#scribbler";

export function fileViewText(lines: Array<ScribblerJsx.Element>, addEmptyFinalLine: boolean): ScribblerJsx.Element {
  return (
    <Text>
      {[...lines]}
      {addEmptyFinalLine ? <Line /> : undefined}
    </Text>
  );
}

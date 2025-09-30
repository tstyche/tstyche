import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function prologueText(runnerVersion: string, rootPath: string): ScribblerJsx.Element {
  return (
    <Text>
      <Line>
        <Text color={Color.Gray}>{"····"}</Text>
        {" TSTyche "}
        {runnerVersion}
        <Text color={Color.Gray}>
          {" from "}
          {rootPath}
        </Text>
      </Line>
      <Line />
    </Text>
  );
}

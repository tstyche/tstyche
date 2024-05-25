import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function watchUsageText(): ScribblerJsx.Element {
  const usageText = Object.entries({ a: "run all tests", x: "exit" }).map(([key, action]) => {
    return (
      <Line>
        <Text color={Color.Gray}>{"Press"}</Text>
        <Text>{` ${key} `}</Text>
        <Text color={Color.Gray}>{`to ${action}.`}</Text>
      </Line>
    );
  });

  return <Text>{usageText}</Text>;
}

import { Color, Line, Scribbler, Text } from "#scribbler";

const usageMap = {
  a: "run all tests",
  x: "exit",
};

export function watchModeUsageText(): JSX.Element {
  const usageText = Object.entries(usageMap).map(([key, action]) => {
    return (
      <Line>
        <Text color={Color.Gray}>{"Press"}</Text>
        <Text>{` ${key} `}</Text>
        <Text color={Color.Gray}>{`to ${action}.`}</Text>
      </Line>
    );
  });

  return (
    <Text>
      {usageText}
    </Text>
  );
}

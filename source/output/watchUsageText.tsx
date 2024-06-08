import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function watchUsageText(): ScribblerJsx.Element {
  const usage: Array<[keyText: string, actionText: string]> = [
    ["a", "to run all tests."],
    ["x", "to exit."],
  ];

  const usageText = usage.map(([keyText, actionText]) => {
    return (
      <Line>
        <Text color={Color.Gray}>{"Press"}</Text>
        <Text>{` ${keyText} `}</Text>
        <Text color={Color.Gray}>{actionText}</Text>
      </Line>
    );
  });

  return <Text>{usageText}</Text>;
}

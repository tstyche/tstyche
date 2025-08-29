import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface StatusTextProps {
  status: "fail" | "pass" | "skip" | "fixme" | "todo";
}

function StatusText({ status }: StatusTextProps) {
  switch (status) {
    case "fail":
      return <Text color={Color.Red}>×</Text>;
    case "pass":
      return <Text color={Color.Green}>+</Text>;
    case "skip":
      return <Text color={Color.Yellow}>- skip</Text>;
    case "fixme":
      return <Text color={Color.Yellow}>- fixme</Text>;
    case "todo":
      return <Text color={Color.Magenta}>- todo</Text>;
  }
}

export function testNameText(
  status: "fail" | "pass" | "skip" | "fixme" | "todo",
  name: string,
  indent = 0,
): ScribblerJsx.Element {
  return (
    <Line indent={indent + 1}>
      <StatusText status={status} /> <Text color={Color.Gray}>{name}</Text>
    </Line>
  );
}

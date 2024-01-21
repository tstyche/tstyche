import { Color, Line, Scribbler, Text } from "#scribbler";

class StatusText implements JSX.ElementClass {
  constructor(readonly props: { status: "fail" | "pass" | "skip" | "todo" }) {}

  render() {
    switch (this.props.status) {
      case "fail":
        return <Text color={Color.Red}>×</Text>;
      case "pass":
        return <Text color={Color.Green}>+</Text>;
      case "skip":
        return <Text color={Color.Yellow}>- skip</Text>;
      case "todo":
        return <Text color={Color.Magenta}>- todo</Text>;
    }
  }
}

export function testNameText(status: "fail" | "pass" | "skip" | "todo", name: string, indent = 0): JSX.Element {
  return (
    <Line indent={indent + 1}>
      <StatusText status={status} /> <Text color={Color.Gray}>{name}</Text>
    </Line>
  );
}

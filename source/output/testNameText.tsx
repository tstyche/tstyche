import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface StatusTextProps {
  status: "fail" | "pass" | "skip" | "todo";
}

class StatusText implements ScribblerJsx.ElementClass {
  props: StatusTextProps;

  constructor(props: StatusTextProps) {
    this.props = props;
  }

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

export function testNameText(
  status: "fail" | "pass" | "skip" | "todo",
  name: string,
  indent = 0,
): ScribblerJsx.Element {
  return (
    <Line indent={indent + 1}>
      <StatusText status={status} /> <Text color={Color.Gray}>{name}</Text>
    </Line>
  );
}

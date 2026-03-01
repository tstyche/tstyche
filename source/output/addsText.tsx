import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function addsText(
  packageVersion: string,
  packagePath: string,
  options?: { short?: boolean },
): ScribblerJsx.Element {
  if (options?.short) {
    return (
      <Line>
        <Text color={Color.Gray}>{packageVersion}</Text>
      </Line>
    );
  }

  return (
    <Line>
      <Text color={Color.Gray}>{"adds"}</Text>
      {" TypeScript "}
      {packageVersion}
      <Text color={Color.Gray}>
        {" to "}
        {packagePath}
      </Text>
    </Line>
  );
}

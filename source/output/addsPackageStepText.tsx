import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function addsPackageStepText(packageVersion: string, packagePath: string): ScribblerJsx.Element {
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

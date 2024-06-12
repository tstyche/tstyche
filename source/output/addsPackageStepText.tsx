import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function addsPackageStepText(compilerVersion: string, installationPath: string): ScribblerJsx.Element {
  return (
    <Line>
      <Text color={Color.Gray}>{"adds"}</Text>
      {" TypeScript "}
      {compilerVersion}
      <Text color={Color.Gray}>
        {" to "}
        {installationPath}
      </Text>
    </Line>
  );
}

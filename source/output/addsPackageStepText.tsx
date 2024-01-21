import { Color, Line, Scribbler, Text } from "#scribbler";

export function addsPackageStepText(compilerVersion: string, installationPath: string): JSX.Element {
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

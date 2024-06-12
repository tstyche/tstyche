import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function usesCompilerStepText(
  compilerVersion: string,
  tsconfigFilePath: string | undefined,
  options?: { prependEmptyLine: boolean },
): ScribblerJsx.Element {
  let projectPathText: ScribblerJsx.Element | undefined;

  if (tsconfigFilePath != null) {
    projectPathText = (
      <Text color={Color.Gray}>
        {" with "}
        {Path.relative("", tsconfigFilePath)}
      </Text>
    );
  }

  return (
    <Text>
      {options?.prependEmptyLine === true ? <Line /> : undefined}
      <Line>
        <Text color={Color.Blue}>{"uses"}</Text>
        {" TypeScript "}
        {compilerVersion}
        {projectPathText}
      </Line>
      <Line />
    </Text>
  );
}

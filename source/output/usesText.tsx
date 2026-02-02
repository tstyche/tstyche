import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function usesText(
  compilerVersion: string,
  projectConfigFilePath: string | undefined,
  options?: { short?: boolean },
): ScribblerJsx.Element {
  if (options?.short) {
    return <Text color={Color.Blue}>{compilerVersion}</Text>;
  }

  let projectConfigPathText: ScribblerJsx.Element | undefined;

  if (projectConfigFilePath != null) {
    projectConfigPathText = (
      <Text color={Color.Gray}>
        {" with "}
        {Path.relative("", projectConfigFilePath)}
      </Text>
    );
  }

  return (
    <Text>
      <Line>
        <Text color={Color.Blue}>{"uses"}</Text>
        {" TypeScript "}
        {compilerVersion}
        {projectConfigPathText}
      </Line>
      <Line />
    </Text>
  );
}

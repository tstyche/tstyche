import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

class ProjectNameText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { filePath: string }) {}

  render(): ScribblerJsx.Element {
    return (
      <Text color={Color.Gray}>
        {" with "}
        {Path.relative("", this.props.filePath)}
      </Text>
    );
  }
}

export function usesCompilerStepText(
  compilerVersion: string,
  tsconfigFilePath: string | undefined,
  options?: { prependEmptyLine: boolean },
): ScribblerJsx.Element {
  let projectPathText: ScribblerJsx.Element | undefined;

  if (tsconfigFilePath != null) {
    projectPathText = <ProjectNameText filePath={tsconfigFilePath} />;
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

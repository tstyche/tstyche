import { Path } from "#path";
// biome-ignore lint/correctness/noUnusedImports: TODO false positive
import { Color, Line, Scribbler, Text } from "#scribbler";

class ProjectNameText implements JSX.ElementClass {
  constructor(readonly props: { filePath: string }) {}

  render(): JSX.Element {
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
): JSX.Element {
  let projectPathText: JSX.Element | undefined;

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

import { Path } from "#path";
import { Color } from "../Color.js";
import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";

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
  const projectPathText =
    typeof tsconfigFilePath === "string" ? <ProjectNameText filePath={tsconfigFilePath} /> : undefined;

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

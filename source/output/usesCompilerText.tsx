import { Path } from "#path";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function usesCompilerText(
  compilerVersion: string,
  projectConfigFilePath: string | undefined,
  options?: { prependEmptyLine?: boolean; short?: boolean },
  mergeCompilerOptions?: string | undefined,
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

  let mergeCompilerOptionsText: ScribblerJsx.Element | undefined;

  if (mergeCompilerOptions != null) {
    mergeCompilerOptionsText = (
      <Text color={Color.Gray}>
        {" and merges '"}
        {mergeCompilerOptions}
        {"'"}
      </Text>
    );
  }

  return (
    <Text>
      {options?.prependEmptyLine ? <Line /> : undefined}
      <Line>
        <Text color={Color.Blue}>{"uses"}</Text>
        {" TypeScript "}
        {compilerVersion}
        {projectConfigPathText}
        {mergeCompilerOptionsText}
      </Line>
      <Line />
    </Text>
  );
}

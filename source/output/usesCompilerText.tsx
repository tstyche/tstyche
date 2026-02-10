import { Path } from "#path";
import { type ProjectConfig, ProjectConfigKind } from "#project";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

export function usesCompilerText(
  compilerVersion: string,
  projectConfig: ProjectConfig,
  options?: { prependEmptyLine?: boolean; short?: boolean },
): ScribblerJsx.Element {
  if (options?.short) {
    return <Text color={Color.Blue}>{compilerVersion}</Text>;
  }

  let projectConfigText: ScribblerJsx.Element | undefined;

  switch (projectConfig.kind) {
    case ProjectConfigKind.Discovered:
    case ProjectConfigKind.Provided:
      projectConfigText = (
        <Text color={Color.Gray}>
          {" with "}
          {Path.relative("", projectConfig.specifier)}
        </Text>
      );
      break;

    case ProjectConfigKind.Default:
      projectConfigText = (
        <Text color={Color.Gray}>
          {" with "}
          {projectConfig.specifier}
          {" TSConfig"}
        </Text>
      );
      break;

    case ProjectConfigKind.Synthetic:
      projectConfigText = <Text color={Color.Gray}>{" with inline TSConfig"}</Text>;
      break;
  }

  return (
    <Text>
      {options?.prependEmptyLine ? <Line /> : undefined}
      <Line>
        <Text color={Color.Blue}>{"uses"}</Text>
        {" TypeScript "}
        {compilerVersion}
        {projectConfigText}
      </Line>
      <Line />
    </Text>
  );
}

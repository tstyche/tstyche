import { Color } from "../Color.js";
import { Scribbler } from "../Scribbler.js";
import { Line } from "./Line.js";
import { Text } from "./Text.js";

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

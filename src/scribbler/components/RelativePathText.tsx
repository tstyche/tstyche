import path from "node:path";
import { Scribbler } from "../Scribbler.js";
import { Text } from "../Text.js";

export class RelativePathText implements JSX.ElementClass {
  constructor(readonly props: { isDirectory?: boolean; to: string }) {}

  render(): JSX.Element {
    const relativePath = path.relative("", this.props.to).replace(/\\/g, "/");

    if (relativePath === "") {
      return <Text>{"./"}</Text>;
    }

    return (
      <Text>
        {relativePath.startsWith(".") ? "" : "./"}
        {relativePath}
        {this.props.isDirectory === true ? "/" : ""}
      </Text>
    );
  }
}

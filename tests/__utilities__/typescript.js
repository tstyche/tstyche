import { version } from "typescript";

export function getTypeScriptVersionMajor() {
  return `ts${version.split(".")[0]}`;
}

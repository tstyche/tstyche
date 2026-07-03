import fs from "node:fs";
import type * as ts from "#typescript";
import { TextFile } from "./TextFile.js";

export function getTextFile(source: ts.SourceFile | string): TextFile {
  if (typeof source === "string") {
    // TODO better get file text directly from 'program'
    const text = fs.readFileSync(source, { encoding: "utf8" });

    return new TextFile(source, text);
  }

  return new TextFile(source.fileName, source.text);
}

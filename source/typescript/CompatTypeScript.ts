import type ts from "typescript";
import { BaseAdapter } from "./BaseAdapter.js";

export class CompatTypeScript extends BaseAdapter {
  // TODO make this private after implementing all needed methods
  compiler: typeof ts;
  version: string;

  SyntaxKind: typeof ts.SyntaxKind;

  constructor(compiler: typeof ts, version: string) {
    super();

    this.compiler = compiler;
    this.version = version;

    this.SyntaxKind = compiler.SyntaxKind;
  }

  async close() {
    // await this.#cleanup();
  }

  getLeadingCommentRanges(text: string, pos: number) {
    return this.compiler.getLeadingCommentRanges(text, pos);
  }
}

import type * as tsast from "@typescript/native-preview/unstable/ast";
import { BaseAdapter } from "./BaseAdapter.js";

export class NativeTypeScript extends BaseAdapter {
  #ast: typeof tsast;
  version: string;

  SyntaxKind: typeof tsast.SyntaxKind;

  constructor(ast: typeof tsast, version: string) {
    super();

    this.#ast = ast;
    this.version = version;

    this.SyntaxKind = ast.SyntaxKind;
  }

  async close() {
    // await this.#cleanup();
  }

  getLeadingCommentRanges(text: string, pos: number) {
    return this.#ast.getLeadingCommentRanges(text, pos);
  }
}

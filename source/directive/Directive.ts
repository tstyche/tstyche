import type ts from "typescript";

export class Directive {
  static isTemplate(compiler: typeof ts, text: string): boolean | undefined {
    const commentRanges = compiler.getLeadingCommentRanges(text, 0);

    return commentRanges?.some((range) => {
      return (
        range.kind === compiler.SyntaxKind.SingleLineCommentTrivia &&
        /^\/\/\s*@tstyche-template/.test(text.substring(range.pos, range.end))
      );
    });
  }
}

import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { ConfigParser } from "./ConfigParser.js";
import { DirectiveDiagnosticText } from "./DirectiveDiagnosticText.js";
import { JsonScanner } from "./JsonScanner.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { Target } from "./Target.js";
import type { InlineConfig, OptionValue } from "./types.js";

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface DirectiveRange {
  namespace: TextRange;
  directive?: TextRange;
  argument?: TextRange;
}

export type DirectiveRanges = Array<DirectiveRange> & { sourceFile: ts.SourceFile };

export class Directive {
  static #commentSeparatorRegex = /--+/;
  static #directiveRegex = /^(\/\/\s*@tstyche)(\s*|-)?(\S*)?(\s*)?(.*)?/i;

  static getDirectiveRanges(compiler: typeof ts, sourceFile: ts.SourceFile, position = 0): DirectiveRanges | undefined {
    const comments = compiler.getLeadingCommentRanges(sourceFile.text, position);

    if (!comments || comments.length === 0) {
      return;
    }

    const ranges: DirectiveRanges = Object.assign([], { sourceFile });

    for (const comment of comments) {
      if (comment.kind !== compiler.SyntaxKind.SingleLineCommentTrivia) {
        continue;
      }

      const range = Directive.#getRange(sourceFile, comment);

      if (range != null) {
        ranges.push(range);
      }
    }

    return ranges;
  }

  static async getInlineConfig(ranges: DirectiveRanges | undefined): Promise<InlineConfig | undefined> {
    if (!ranges) {
      return;
    }

    const inlineConfig: InlineConfig = {};

    for (const range of ranges) {
      await Directive.#parse(inlineConfig, ranges.sourceFile, range);
    }

    return inlineConfig;
  }

  static #getRange(sourceFile: ts.SourceFile, comment: ts.CommentRange) {
    const [text] = sourceFile.text.substring(comment.pos, comment.end).split(Directive.#commentSeparatorRegex);
    const found = text?.match(Directive.#directiveRegex);

    const namespaceText = found?.[1];

    if (!namespaceText) {
      return;
    }

    const range: DirectiveRange = {
      namespace: { start: comment.pos, end: comment.pos + namespaceText.length, text: namespaceText },
    };

    const directiveSeparatorText = found?.[2];
    const directiveText = found?.[3];

    if (directiveText != null && directiveText.length > 0) {
      const start = range.namespace.end + (directiveSeparatorText?.length ?? 0);

      range.directive = { start, end: start + directiveText.length, text: directiveText };
    }

    const argumentSeparatorText = found?.[4];
    const argumentText = found?.[5]?.trimEnd();

    if (range.directive != null && argumentText != null && argumentText.length > 0) {
      const start = range.directive.end + (argumentSeparatorText?.length ?? 0);

      range.argument = { start, end: start + argumentText.length, text: argumentText };
    }

    return range;
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["directive:error", { diagnostics: [diagnostic] }]);
  }

  static async #parse(inlineConfig: InlineConfig, sourceFile: ts.SourceFile, ranges: DirectiveRange) {
    switch (ranges.directive?.text) {
      case "if":
        {
          if (!ranges.argument?.text) {
            const text = DirectiveDiagnosticText.requiresArgument(ranges.directive.text);
            const origin = new DiagnosticOrigin(ranges.directive.start, ranges.directive.end, sourceFile);

            Directive.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const value = await Directive.#parseJson(sourceFile, ranges.argument.start, ranges.argument.end);

          inlineConfig.if = value;
        }
        return;

      case "template":
        if (ranges.argument?.text != null) {
          const text = DirectiveDiagnosticText.doesNotTakeArgument(ranges.directive.text);
          const origin = new DiagnosticOrigin(ranges.directive.start, ranges.directive.end, sourceFile);

          Directive.#onDiagnostics(Diagnostic.error(text, origin));
        }

        inlineConfig.template = true;
        return;
    }

    const target = ranges?.directive ?? ranges.namespace;

    const text = DirectiveDiagnosticText.isNotSupported(target.text);
    const origin = new DiagnosticOrigin(target.start, target.end, sourceFile);

    Directive.#onDiagnostics(Diagnostic.error(text, origin));
  }

  static async #parseJson(sourceFile: ts.SourceFile, start: number, end: number): Promise<Record<string, OptionValue>> {
    const inlineOptions: Record<string, OptionValue> = {};

    const configParser = new ConfigParser(
      inlineOptions as Record<string, OptionValue>,
      OptionGroup.InlineConditions,
      sourceFile,
      new JsonScanner(sourceFile, { start, end }),
      Directive.#onDiagnostics,
    );

    await configParser.parse();

    if ("target" in inlineOptions) {
      inlineOptions["target"] = await Target.expand(inlineOptions["target"] as Array<string>);
    }

    return inlineOptions;
  }
}

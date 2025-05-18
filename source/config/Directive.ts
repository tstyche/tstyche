import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { ConfigParser } from "./ConfigParser.js";
import { DirectiveDiagnosticText } from "./DirectiveDiagnosticText.js";
import { JsonScanner } from "./JsonScanner.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { Target } from "./Target.js";
import type { InlineConfig, OptionValue } from "./types.js";

interface TextRange {
  start: number;
  end: number;
  text: string;
}

interface DirectiveTextRanges {
  namespace: TextRange;
  directive?: TextRange;
  argument?: TextRange;
}

export class Directive {
  static #directiveRegex = /^(\/\/\s*@tstyche)(\s*|-)?(\S*)?(\s*)?(.*)?/i;

  static async getInlineConfig(
    compiler: typeof ts,
    sourceFile: ts.SourceFile | undefined,
    position = 0,
  ): Promise<InlineConfig | undefined> {
    if (!sourceFile) {
      return;
    }

    const inlineConfig: InlineConfig = {};

    const comments = compiler.getLeadingCommentRanges(sourceFile.text, position);

    if (comments != null) {
      for (const comment of comments) {
        if (comment.kind !== compiler.SyntaxKind.SingleLineCommentTrivia) {
          continue;
        }

        await Directive.#parse(inlineConfig, sourceFile, comment);
      }
    }

    return inlineConfig;
  }

  static #getTextRanges(sourceFile: ts.SourceFile, comment: ts.CommentRange) {
    const found = sourceFile.text.substring(comment.pos, comment.end).match(Directive.#directiveRegex);

    const namespaceText = found?.[1];

    if (!namespaceText) {
      return;
    }

    const ranges: DirectiveTextRanges = {
      namespace: { start: comment.pos, end: comment.pos + namespaceText.length, text: namespaceText },
    };

    const directiveSeparatorText = found?.[2];
    const directiveText = found?.[3];

    if (directiveText != null && directiveText.length > 0) {
      const start = ranges.namespace.end + (directiveSeparatorText?.length ?? 0);

      ranges.directive = { start, end: start + directiveText.length, text: directiveText };
    }

    const argumentSeparatorText = found?.[4];
    const argumentText = found?.[5]?.trimEnd();

    if (ranges.directive != null && argumentText != null && argumentText.length > 0) {
      const start = ranges.directive.end + (argumentSeparatorText?.length ?? 0);

      ranges.argument = { start, end: start + argumentText.length, text: argumentText };
    }

    return ranges;
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["directive:error", { diagnostics: [diagnostic] }]);
  }

  static async #parse(inlineConfig: InlineConfig, sourceFile: ts.SourceFile, comment: ts.CommentRange) {
    const ranges = Directive.#getTextRanges(sourceFile, comment);

    if (!ranges) {
      return;
    }

    switch (ranges.directive?.text) {
      case "if":
        {
          if (!ranges.argument?.text) {
            const text = DirectiveDiagnosticText.requiresArgument(ranges.directive.text);
            const origin = new DiagnosticOrigin(ranges.directive.start, ranges.directive.end, sourceFile);

            Directive.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const value: { target?: Array<string> } = await Directive.#parseJson(
            sourceFile,
            ranges.argument.start,
            ranges.argument.end,
          );

          if (!value) {
            return;
          }

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
      OptionGroup.InlineConfig,
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

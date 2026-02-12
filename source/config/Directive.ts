import type ts from "typescript";
import type { TestTreeNode } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { JsonScanner } from "#json";
import { ConfigParser } from "./ConfigParser.js";
import { DirectiveDiagnosticText } from "./DirectiveDiagnosticText.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import type { DirectiveRange, InlineConfig, OptionValue } from "./types.js";

export class Directive {
  static #directiveRegex = /^(\/\/ *@tstyche)( *|-)?(\S*)?( *)?(.*)?/i;
  static #rangeCache = new WeakMap<ts.Node, Array<DirectiveRange>>();

  static getDirectiveRange(
    compiler: typeof ts,
    owner: TestTreeNode,
    directiveText: string,
  ): DirectiveRange | undefined {
    const directiveRanges = Directive.getDirectiveRanges(compiler, owner.node);

    return directiveRanges?.find((range) => range.directive?.text === directiveText);
  }

  static getDirectiveRanges(compiler: typeof ts, node: ts.Node): Array<DirectiveRange> | undefined {
    let ranges = Directive.#rangeCache.get(node);

    if (ranges != null) {
      return ranges;
    }

    let sourceFile: ts.SourceFile;
    let position = 0;

    if (compiler.isSourceFile(node)) {
      sourceFile = node;
    } else {
      sourceFile = node.getSourceFile();
      position = node.getFullStart();
    }

    const comments = compiler.getLeadingCommentRanges(sourceFile.text, position);

    if (!comments || comments.length === 0) {
      return;
    }

    ranges = [];

    for (const comment of comments) {
      if (comment.kind !== compiler.SyntaxKind.SingleLineCommentTrivia) {
        continue;
      }

      const range = Directive.#getRange(sourceFile, comment);

      if (range != null) {
        ranges.push(range);
      }
    }

    Directive.#rangeCache.set(node, ranges);

    return ranges;
  }

  static async getInlineConfig(
    ranges: Array<DirectiveRange> | DirectiveRange | undefined,
  ): Promise<InlineConfig | undefined> {
    if (!ranges) {
      return;
    }

    ranges = Array.isArray(ranges) ? ranges : [ranges];

    const inlineConfig: InlineConfig = {};

    for (const range of ranges) {
      await Directive.#parse(inlineConfig, range);
    }

    return inlineConfig;
  }

  static #getRange(sourceFile: ts.SourceFile, comment: ts.CommentRange) {
    const [text] = sourceFile.text.substring(comment.pos, comment.end).split(/--+/);
    const match = text?.match(Directive.#directiveRegex);

    const namespaceText = match?.[1];

    if (!namespaceText) {
      return;
    }

    const range: DirectiveRange = {
      sourceFile,
      namespace: { start: comment.pos, end: comment.pos + namespaceText.length, text: namespaceText },
    };

    const directiveSeparatorText = match[2];
    const directiveText = match[3];

    if (typeof directiveText === "string" && typeof directiveSeparatorText === "string") {
      const start = range.namespace.end + directiveSeparatorText.length;

      range.directive = { start, end: start + directiveText.length, text: directiveText };

      const argumentSeparatorText = match[4];
      const argumentText = match[5]?.trimEnd();

      if (typeof argumentSeparatorText === "string" && typeof argumentText === "string") {
        const start = range.directive.end + argumentSeparatorText.length;

        range.argument = { start, end: start + argumentText.length, text: argumentText };
      }
    }

    return range;
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["directive:error", { diagnostics: [diagnostic] }]);
  }

  static async #parse(inlineConfig: InlineConfig, range: DirectiveRange) {
    switch (range.directive?.text) {
      case "if":
        {
          if (!range.argument?.text) {
            const text = DirectiveDiagnosticText.requiresArgument();
            const origin = new DiagnosticOrigin(range.namespace.start, range.directive.end, range.sourceFile);

            Directive.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const value = await Directive.#parseJson(range.sourceFile, range.argument.start, range.argument.end);

          inlineConfig.if = value;
        }
        return;

      case "fixme":
      case "template":
        if (range.argument?.text != null) {
          const text = DirectiveDiagnosticText.doesNotTakeArgument();
          const origin = new DiagnosticOrigin(range.argument.start, range.argument.end, range.sourceFile);

          Directive.#onDiagnostics(Diagnostic.error(text, origin));
        }

        inlineConfig[range.directive.text] = true;
        return;
    }

    const target = range.directive ?? range.namespace;

    const text = DirectiveDiagnosticText.isNotSupported(target.text);
    const origin = new DiagnosticOrigin(target.start, target.end, range.sourceFile);

    Directive.#onDiagnostics(Diagnostic.error(text, origin));
  }

  static async #parseJson(sourceFile: ts.SourceFile, start: number, end: number): Promise<Record<string, OptionValue>> {
    const inlineOptions: Record<string, OptionValue> = {};

    const configParser = new ConfigParser(
      inlineOptions,
      OptionGroup.InlineConditions,
      sourceFile,
      new JsonScanner(sourceFile, { start, end }),
      Directive.#onDiagnostics,
    );

    await configParser.parse();

    return inlineOptions;
  }
}

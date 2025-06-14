import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { diagnosticBelongsToNode, isDiagnosticWithLocation } from "#diagnostic";
import type { ProjectService } from "#project";
import type { AssertionNode } from "./AssertionNode.js";
import { nodeIsChildOfExpressionStatement } from "./helpers.js";
import type { TestTree } from "./TestTree.js";
import type { SuppressedError } from "./types.js";
import type { WhenNode } from "./WhenNode.js";

interface TextRange {
  start: number;
  end: number;
  replacement?: string;
}

export class AbilityLayer {
  #compiler: typeof ts;
  #filePath = "";
  #nodes: Array<AssertionNode | WhenNode> = [];
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;
  #suppressedErrors: Map<number, SuppressedError> | undefined;
  #text = "";

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#projectService = projectService;
    this.#resolvedConfig = resolvedConfig;
  }

  #getErasedRangeText(range: TextRange) {
    if (this.#text.indexOf("\n", range.start) >= range.end) {
      return " ".repeat(range.end - range.start);
    }

    const text: Array<string> = [];

    for (let index = range.start; index < range.end; index++) {
      const character = this.#text.charAt(index);

      switch (character) {
        case "\n":
        case "\r":
          text.push(character);
          break;

        default:
          text.push(" ");
      }
    }

    return text.join("");
  }

  #addRanges(node: AssertionNode | WhenNode, ranges: Array<TextRange>): void {
    this.#nodes.push(node);

    for (const range of ranges) {
      const rangeText =
        range.replacement != null
          ? `${range.replacement}${this.#getErasedRangeText(range).slice(range.replacement.length)}`
          : this.#getErasedRangeText(range);

      this.#text = `${this.#text.slice(0, range.start)}${rangeText}${this.#text.slice(range.end)}`;
    }
  }

  close(): void {
    if (this.#nodes.length > 0 || this.#suppressedErrors != null) {
      this.#projectService.openFile(this.#filePath, this.#text, this.#resolvedConfig.rootPath);

      const languageService = this.#projectService.getLanguageService(this.#filePath);

      const diagnostics = new Set(languageService?.getSemanticDiagnostics(this.#filePath));

      // TODO only run this if there are nodes

      for (const node of this.#nodes.toReversed()) {
        for (const diagnostic of diagnostics) {
          if (diagnosticBelongsToNode(diagnostic, "matcherNode" in node ? node.matcherNode : node.actionNode)) {
            if (!node.abilityDiagnostics) {
              node.abilityDiagnostics = new Set();
            }

            node.abilityDiagnostics.add(diagnostic);

            diagnostics.delete(diagnostic);
          }
        }
      }

      // TODO only run this if there are suppressedErrors

      for (const diagnostic of diagnostics) {
        if (!isDiagnosticWithLocation(diagnostic)) {
          continue;
        }

        const { file, start } = diagnostic;

        const lineMap = file.getLineStarts();
        let line = this.#compiler.getLineAndCharacterOfPosition(file, start).line - 1;

        while (line >= 0) {
          const suppressedError = this.#suppressedErrors?.get(line);

          if (suppressedError != null) {
            suppressedError.diagnostic = diagnostic;
            break;
          }

          const lineText = file.text.slice(lineMap[line], lineMap[line + 1]).trim();
          if (lineText !== "" && !lineText.startsWith("//")) {
            break;
          }

          line--;
        }
      }
    }

    this.#filePath = "";
    this.#nodes = [];
    this.#suppressedErrors = undefined;
    this.#text = "";
  }

  #eraseTrailingComma(node: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>, parent: AssertionNode | WhenNode) {
    if (node.hasTrailingComma) {
      this.#addRanges(parent, [{ start: node.end - 1, end: node.end }]);
    }
  }

  handleWhen(whenNode: WhenNode): void {
    const whenStart = whenNode.node.getStart();
    const whenExpressionEnd = whenNode.node.expression.getEnd();
    const whenEnd = whenNode.node.getEnd();
    const actionNameEnd = whenNode.actionNameNode.getEnd();

    switch (whenNode.actionNameNode.name.text) {
      case "isCalledWith":
        this.#eraseTrailingComma(whenNode.target, whenNode);

        this.#addRanges(whenNode, [
          {
            start: whenStart,
            end: whenExpressionEnd,
            replacement: nodeIsChildOfExpressionStatement(this.#compiler, whenNode.actionNode) ? ";" : "",
          },
          { start: whenEnd, end: actionNameEnd },
        ]);

        break;
    }
  }

  handleAssertion(assertionNode: AssertionNode): void {
    const expectStart = assertionNode.node.getStart();
    const expectExpressionEnd = assertionNode.node.expression.getEnd();
    const expectEnd = assertionNode.node.getEnd();
    const matcherNameEnd = assertionNode.matcherNameNode.getEnd();

    switch (assertionNode.matcherNameNode.name.text) {
      case "toBeApplicable":
        this.#addRanges(assertionNode, [
          { start: expectStart, end: expectExpressionEnd },
          { start: expectEnd, end: matcherNameEnd },
        ]);

        break;

      case "toBeCallableWith":
        this.#eraseTrailingComma(assertionNode.source, assertionNode);

        this.#addRanges(assertionNode, [
          {
            start: expectStart,
            end: expectExpressionEnd,
            replacement: nodeIsChildOfExpressionStatement(this.#compiler, assertionNode.matcherNode) ? ";" : "",
          },
          { start: expectEnd, end: matcherNameEnd },
        ]);

        break;

      case "toBeConstructableWith":
        this.#eraseTrailingComma(assertionNode.source, assertionNode);

        this.#addRanges(assertionNode, [
          {
            start: expectStart,
            end: expectExpressionEnd,
            replacement: nodeIsChildOfExpressionStatement(this.#compiler, assertionNode.matcherNode) ? "; new" : "new",
          },
          { start: expectEnd, end: matcherNameEnd },
        ]);

        break;
    }
  }

  handleSuppressedErrors(testTree: TestTree): void {
    if (!testTree.suppressedErrors) {
      return;
    }

    this.#suppressedErrors = new Map();

    for (const suppressedError of testTree.suppressedErrors) {
      const { start, end } = suppressedError.directive;
      const rangeText = this.#getErasedRangeText({ start: start + 2, end });

      this.#text = `${this.#text.slice(0, start + 2)}${rangeText}${this.#text.slice(end)}`;

      const { line } = testTree.sourceFile.getLineAndCharacterOfPosition(start);

      this.#suppressedErrors.set(line, suppressedError);
    }
  }

  open(sourceFile: ts.SourceFile): void {
    this.#filePath = sourceFile.fileName;
    this.#text = sourceFile.text;
  }
}

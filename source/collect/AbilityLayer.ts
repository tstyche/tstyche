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
  #expectErrorRegex = /^(\s*)(\/\/ *@ts-expect-error)(!?)(:? *)(.*)?$/gim;
  #filePath = "";
  #nodes: Array<AssertionNode | WhenNode> = [];
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;
  #suppressedErrorsMap: Map<number, SuppressedError> | undefined;
  #text = "";

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#projectService = projectService;
    this.#resolvedConfig = resolvedConfig;
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

  #belongsToNode(diagnostic: ts.Diagnostic) {
    for (const node of this.#nodes) {
      if (diagnosticBelongsToNode(diagnostic, "matcherNode" in node ? node.matcherNode : node.actionNode)) {
        node.abilityDiagnostics.add(diagnostic);

        return true;
      }
    }

    return false;
  }

  #belongsToDirective(diagnostic: ts.Diagnostic) {
    if (!isDiagnosticWithLocation(diagnostic)) {
      return;
    }

    const { file, start } = diagnostic;

    const lineMap = file.getLineStarts();
    let line = this.#compiler.getLineAndCharacterOfPosition(file, start).line - 1;

    while (line >= 0) {
      const suppressedError = this.#suppressedErrorsMap?.get(line);

      if (suppressedError != null) {
        suppressedError.diagnostics.push(diagnostic);
        break;
      }

      const lineText = file.text.slice(lineMap[line], lineMap[line + 1]).trim();
      if (lineText !== "" && !lineText.startsWith("//")) {
        break;
      }

      line--;
    }
  }

  #collectSuppressedErrors() {
    const ranges: Array<SuppressedError> = [];

    for (const match of this.#text.matchAll(this.#expectErrorRegex)) {
      const offsetText = match?.[1];
      const directiveText = match?.[2];
      const ignoreText = match?.[3];
      const argumentSeparatorText = match?.[4];
      const argumentText = match?.[5]?.split(/--+/)[0]?.trimEnd();

      if (typeof offsetText !== "string" || !directiveText) {
        continue;
      }

      const start = match.index + offsetText.length;

      const range: SuppressedError = {
        directive: { start, end: start + directiveText.length, text: directiveText },
        ignore: ignoreText === "!",
        diagnostics: [],
      };

      if (typeof argumentSeparatorText === "string" && typeof argumentText === "string") {
        const start = range.directive.end + argumentSeparatorText.length;

        range.argument = { start, end: start + argumentText.length, text: argumentText };
      }

      ranges.push(range);
    }

    return ranges;
  }

  close(): void {
    if (this.#nodes.length > 0 || this.#suppressedErrorsMap != null) {
      this.#projectService.openFile(this.#filePath, this.#text, this.#resolvedConfig.rootPath);

      const languageService = this.#projectService.getLanguageService(this.#filePath);
      const diagnostics = languageService?.getSemanticDiagnostics(this.#filePath);

      if (diagnostics != null) {
        this.#nodes.reverse();

        for (const diagnostic of diagnostics) {
          if (this.#belongsToNode(diagnostic)) {
            continue;
          }

          this.#belongsToDirective(diagnostic);
        }
      }
    }

    this.#filePath = "";
    this.#nodes = [];
    this.#suppressedErrorsMap = undefined;
    this.#text = "";
  }

  #eraseTrailingComma(node: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>, parent: AssertionNode | WhenNode) {
    if (node.hasTrailingComma) {
      this.#addRanges(parent, [{ start: node.end - 1, end: node.end }]);
    }
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

  #handleSuppressedErrors(testTree: TestTree) {
    const suppressedErrors = this.#collectSuppressedErrors();

    if (this.#resolvedConfig.checkSuppressedErrors) {
      testTree.suppressedErrors = suppressedErrors;
      this.#suppressedErrorsMap = new Map();
    }

    for (const suppressedError of suppressedErrors) {
      const { start, end } = suppressedError.directive;
      const rangeText = this.#getErasedRangeText({ start: start + 2, end });

      this.#text = `${this.#text.slice(0, start + 2)}${rangeText}${this.#text.slice(end)}`;

      if (this.#suppressedErrorsMap != null) {
        const { line } = testTree.sourceFile.getLineAndCharacterOfPosition(start);

        this.#suppressedErrorsMap.set(line, suppressedError);
      }
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

  open(testTree: TestTree): void {
    this.#filePath = testTree.sourceFile.fileName;
    this.#text = testTree.sourceFile.text;

    this.#handleSuppressedErrors(testTree);
  }
}

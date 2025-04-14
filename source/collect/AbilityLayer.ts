import type ts from "typescript";
import type { AssertionNode } from "#collect";
import type { ResolvedConfig } from "#config";
import { textRangeContainsDiagnostic } from "#diagnostic";
import type { ProjectService } from "#project";

interface TextRange {
  end: number;
  replacement?: string;
  start: number;
}

export class AbilityLayer {
  #filePath = "";
  #nodes: Array<AssertionNode> = [];
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;
  #text = "";

  constructor(projectService: ProjectService, resolvedConfig: ResolvedConfig) {
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

  #addRanges(node: AssertionNode, ranges: Array<TextRange>): void {
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
    if (this.#nodes.length > 0) {
      this.#projectService.openFile(this.#filePath, this.#text, this.#resolvedConfig.rootPath);

      const languageService = this.#projectService.getLanguageService(this.#filePath);

      const diagnostics = new Set(languageService?.getSemanticDiagnostics(this.#filePath));

      for (const node of this.#nodes.reverse()) {
        for (const diagnostic of diagnostics) {
          if (textRangeContainsDiagnostic(node.matcherNode, diagnostic)) {
            if (!node.abilityDiagnostics) {
              node.abilityDiagnostics = new Set();
            }

            node.abilityDiagnostics.add(diagnostic);

            diagnostics.delete(diagnostic);
          }
        }
      }
    }

    this.#filePath = "";
    this.#nodes = [];
    this.#text = "";
  }

  handleNode(assertionNode: AssertionNode): void {
    const expectStart = assertionNode.node.getStart();
    const expectExpressionEnd = assertionNode.node.expression.getEnd();
    const expectEnd = assertionNode.node.getEnd();
    const matcherNameEnd = assertionNode.matcherNameNode.getEnd();

    switch (assertionNode.matcherNameNode.name.text) {
      case "toBeApplicable":
      case "toBeCallableWith":
        this.#addRanges(assertionNode, [
          { end: expectExpressionEnd + 1, start: expectStart },
          { end: matcherNameEnd, start: expectEnd - 1 },
        ]);

        break;

      case "toBeConstructableWith":
        this.#addRanges(assertionNode, [
          { end: expectExpressionEnd, start: expectStart, replacement: "new" },
          { end: matcherNameEnd, start: expectEnd },
        ]);

        break;
    }
  }

  open(sourceFile: ts.SourceFile): void {
    this.#filePath = sourceFile.fileName;
    this.#text = sourceFile.text;
  }
}

import type ts from "typescript";
import type { AssertionNode } from "#collect";
import type { ResolvedConfig } from "#config";
import type { ProjectService } from "#project";

interface TextRange {
  end: number;
  start: number;
  text?: string;
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

  #addRanges(node: AssertionNode, ranges: Array<TextRange>): void {
    this.#nodes.push(node);

    for (const range of ranges) {
      // TODO line ends must be respected
      const rangeText = range.text ?? " ".repeat(range.end - range.start);

      this.#text = `${this.#text.slice(0, range.start)}${rangeText}${this.#text.slice(range.end)}`;
    }
  }

  close(): void {
    if (this.#nodes.length > 0) {
      this.#projectService.openFile(this.#filePath, this.#text, this.#resolvedConfig.rootPath);

      const languageService = this.#projectService.getLanguageService(this.#filePath);

      const diagnostics = new Set(languageService?.getSemanticDiagnostics(this.#filePath)?.toReversed());

      if (diagnostics.size > 0) {
        for (const node of this.#nodes.toReversed()) {
          for (const diagnostic of diagnostics) {
            if (
              diagnostic.start != null &&
              diagnostic.start >= node.matcherNode.pos &&
              diagnostic.start <= node.matcherNode.end
            ) {
              if (!node.abilityDiagnostics) {
                node.abilityDiagnostics = new Set();
              }

              node.abilityDiagnostics.add([diagnostic, node.source[0] ?? node.node]);

              diagnostics.delete(diagnostic);
            }
          }
        }
      }
    }

    this.#filePath = "";
    this.#nodes = [];
    this.#text = "";
  }

  handleNode(assertionNode: AssertionNode): void {
    switch (assertionNode.matcherNameNode.name.text) {
      case "toBeApplicable": {
        const expectStart = assertionNode.node.pos;
        const expectExpressionEnd = assertionNode.node.expression.end;
        const expectEnd = assertionNode.node.end;
        const matcherNameEnd = assertionNode.matcherNameNode.end;

        this.#addRanges(assertionNode, [
          { end: expectExpressionEnd + 1, start: expectStart },
          { end: matcherNameEnd, start: expectEnd - 1 },
        ]);

        break;
      }
    }
  }

  open(sourceFile: ts.SourceFile): void {
    this.#filePath = sourceFile.fileName;
    this.#text = sourceFile.text;
  }
}

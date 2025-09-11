import type ts from "typescript";
import { type ExpectNode, type TestTree, TestTreeNodeBrand, type WhenNode } from "#collect";
import type { ResolvedConfig } from "#config";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { SourceTextEditor } from "./SourceTextEditor.js";
import { SuppressedLayer } from "./SuppressedLayer.js";

export class Layers {
  #abilityLayer: AbilityLayer;
  #editor = new SourceTextEditor();
  #projectService: ProjectService;
  #suppressedDiagnostics: Array<ts.Diagnostic> | undefined;
  #suppressedLayer: SuppressedLayer;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#projectService = projectService;

    this.#abilityLayer = new AbilityLayer();
    this.#suppressedLayer = new SuppressedLayer(compiler, resolvedConfig);
  }

  close(): void {
    const abilityDiagnostics = this.#getNewDiagnostics(
      this.#editor.getFilePath(),
      this.#editor.getText(),
      this.#suppressedDiagnostics,
    );

    this.#suppressedDiagnostics = undefined;

    this.#abilityLayer.close(abilityDiagnostics);
    this.#editor.close();
  }

  #isSameDiagnostic(d1: ts.Diagnostic, d2: ts.Diagnostic) {
    function isSameMessageText(t1: string | ts.DiagnosticMessageChain, t2: string | ts.DiagnosticMessageChain) {
      if (typeof t1 === "string" && typeof t2 === "string") {
        return t1 === d2.messageText;
      }

      if (typeof t1 !== "string" && typeof t2 !== "string") {
        return t1.messageText === t2.messageText;
      }

      return false;
    }

    return (
      d1.file?.fileName === d2.file?.fileName &&
      d1.start === d2.start &&
      d1.length === d2.length &&
      d1.code === d2.code &&
      isSameMessageText(d1.messageText, d2.messageText)
    );
  }

  // TODO could be moved to 'ProjectService'
  #getNewDiagnostics(
    filePath: string,
    sourceText: string,
    seenDiagnostics?: Array<ts.Diagnostic>,
  ): Array<ts.Diagnostic> | undefined {
    this.#projectService.openFile(filePath, sourceText);

    const languageService = this.#projectService.getLanguageService(filePath);
    const diagnostics = languageService?.getSemanticDiagnostics(filePath);

    if (seenDiagnostics != null) {
      return diagnostics?.filter(
        (newDiagnostic) =>
          !seenDiagnostics.some((seenDiagnostic) => this.#isSameDiagnostic(newDiagnostic, seenDiagnostic)),
      );
    }

    return diagnostics;
  }

  open(tree: TestTree): void {
    this.#editor.open(tree.sourceFile);
    this.#suppressedLayer.open(tree, this.#editor);

    this.#suppressedDiagnostics = this.#getNewDiagnostics(this.#editor.getFilePath(), this.#editor.getText());

    this.#suppressedLayer.close(this.#suppressedDiagnostics);
  }

  visit(node: ExpectNode | WhenNode): void {
    switch (node.brand) {
      case TestTreeNodeBrand.Expect:
        this.#abilityLayer.visitExpect(node as ExpectNode, this.#editor);
        break;

      case TestTreeNodeBrand.When:
        this.#abilityLayer.visitWhen(node as WhenNode, this.#editor);
        break;
    }
  }
}

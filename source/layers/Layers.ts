import type ts from "typescript";
import { type ExpectNode, type TestTree, TestTreeNodeBrand, type WhenNode } from "#collect";
import type { ResolvedConfig } from "#config";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { SourceTextEditor } from "./SourceTextEditor.js";
import { SuppressedLayer } from "./SuppressedLayer.js";

export class Layers {
  #abilityLayer: AbilityLayer;
  #editor!: SourceTextEditor;
  #projectService: ProjectService;
  #suppressedLayer: SuppressedLayer;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#projectService = projectService;

    this.#abilityLayer = new AbilityLayer(compiler);
    this.#suppressedLayer = new SuppressedLayer(compiler, resolvedConfig);
  }

  close(tree: TestTree): void {
    const abilityDiagnostics = this.#getNewDiagnostics(this.#editor.getFilePath(), this.#editor.getText());

    this.#abilityLayer.close(tree, abilityDiagnostics);

    // TODO
    // this.#editor = undefined;

    // this.#editor.close() and this.#editor.open(), perhaps?
  }

  // TODO could be moved to 'ProjectService'
  #getNewDiagnostics(
    filePath: string,
    sourceText: string,
    _seenDiagnostics?: Array<ts.Diagnostic>,
  ): Array<ts.Diagnostic> | undefined {
    this.#projectService.openFile(filePath, sourceText);

    const languageService = this.#projectService.getLanguageService(filePath);

    const semanticDiagnostics = languageService?.getSemanticDiagnostics(filePath);

    if (semanticDiagnostics != null) {
      // TODO this should filter out 'seenDiagnostics' and return only fresh ones
      return semanticDiagnostics;
    }

    return;
  }

  open(tree: TestTree): void {
    this.#editor = new SourceTextEditor(tree.sourceFile);

    this.#suppressedLayer.open(tree, this.#editor);

    const suppressedDiagnostics = this.#getNewDiagnostics(this.#editor.getFilePath(), this.#editor.getText());

    this.#suppressedLayer.close(suppressedDiagnostics);
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

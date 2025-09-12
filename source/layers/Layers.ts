import type ts from "typescript";
import { type ExpectNode, type TestTree, TestTreeNodeBrand, type WhenNode } from "#collect";
import type { ResolvedConfig } from "#config";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { compareDiagnostics } from "./helpers.js";
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

    this.#abilityLayer = new AbilityLayer(compiler, this.#editor);
    this.#suppressedLayer = new SuppressedLayer(compiler, this.#editor, resolvedConfig);
  }

  close(): void {
    let isSeenDiagnostic: ((diagnostic: ts.Diagnostic) => boolean) | undefined;

    if (this.#suppressedDiagnostics != null) {
      const seenDiagnostics = this.#suppressedDiagnostics;
      this.#suppressedDiagnostics = undefined;

      isSeenDiagnostic = (diagnostic) =>
        !seenDiagnostics.some((seenDiagnostic) => compareDiagnostics(diagnostic, seenDiagnostic));
    }

    const abilityDiagnostics = this.#projectService.getDiagnostics(
      this.#editor.getFilePath(),
      this.#editor.getText(),
      isSeenDiagnostic,
    );

    this.#abilityLayer.close(abilityDiagnostics);
    this.#editor.close();
  }

  open(tree: TestTree): void {
    this.#editor.open(tree.sourceFile);
    this.#suppressedLayer.open(tree);

    this.#suppressedDiagnostics = this.#projectService.getDiagnostics(
      this.#editor.getFilePath(),
      this.#editor.getText(),
    );

    this.#suppressedLayer.close(this.#suppressedDiagnostics);
  }

  visit(node: ExpectNode | WhenNode): void {
    switch (node.brand) {
      case TestTreeNodeBrand.Expect:
        this.#abilityLayer.visitExpect(node as ExpectNode);
        break;

      case TestTreeNodeBrand.When:
        this.#abilityLayer.visitWhen(node as WhenNode);
        break;
    }
  }
}

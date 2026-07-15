import type { ExpectNode, TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { compareDiagnostics } from "#diagnostic";
import { TextEditor } from "#editor";
import type { ProjectService } from "#project";
import type * as ts from "#typescript";
import { AbilityLayer } from "./AbilityLayer.js";
import { SuppressedLayer } from "./SuppressedLayer.js";

export class Layers {
  #abilityLayer: AbilityLayer;
  #editor = new TextEditor();
  #projectService: ProjectService;
  #suppressedDiagnostics: ReadonlyArray<ts.Diagnostic> | undefined;
  #suppressedLayer: SuppressedLayer;

  constructor(ts: ts.TypeScript, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#projectService = projectService;

    this.#abilityLayer = new AbilityLayer(ts, this.#editor);
    this.#suppressedLayer = new SuppressedLayer(this.#editor, resolvedConfig);
  }

  close(tree: TestTree): void {
    let seenDiagnostics: ReadonlyArray<ts.Diagnostic> = [];

    if (this.#suppressedDiagnostics != null) {
      seenDiagnostics = this.#suppressedDiagnostics;
      this.#suppressedDiagnostics = undefined;
    }

    const diagnostics = this.#projectService
      .updateFile(this.#editor.getFilePath(), this.#editor.getText())
      .getSemanticDiagnostics(this.#editor.getFilePath());

    const offsets = this.#editor.getOffsets();

    const abilityDiagnostics: Array<ts.Diagnostic> = [];

    if (diagnostics != null) {
      for (const diagnostic of diagnostics) {
        const mappedDiagnostic = this.#projectService.getMappedDiagnostic(tree.sourceFile, diagnostic, offsets);

        if (!seenDiagnostics.some((seenDiagnostic) => compareDiagnostics(mappedDiagnostic, seenDiagnostic))) {
          abilityDiagnostics.push(mappedDiagnostic);
        }
      }
    }

    this.#abilityLayer.close(abilityDiagnostics);
    this.#editor.close();
  }

  open(tree: TestTree): void {
    this.#editor.open(tree.sourceFile);
    this.#suppressedLayer.open(tree);

    this.#suppressedDiagnostics = this.#projectService
      .updateFile(this.#editor.getFilePath(), this.#editor.getText())
      .getSemanticDiagnostics(this.#editor.getFilePath());

    this.#suppressedLayer.close(
      this.#suppressedDiagnostics?.map((diagnostic) =>
        this.#projectService.getMappedDiagnostic(tree.sourceFile, diagnostic),
      ),
    );
  }

  visit(node: ExpectNode): void {
    this.#abilityLayer.visitExpect(node);
  }
}

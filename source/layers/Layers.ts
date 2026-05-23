import type ts from "typescript";
import type { ExpectNode, TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { MappedDiagnostic } from "#diagnostic";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { compareDiagnostics } from "./helpers.js";
import { SuppressedLayer } from "./SuppressedLayer.js";
import { TextEditor } from "./TextEditor.js";

export class Layers {
  #abilityLayer: AbilityLayer;
  #editor = new TextEditor();
  #projectService: ProjectService;
  #suppressedDiagnostics: Array<ts.Diagnostic> | undefined;
  #suppressedLayer: SuppressedLayer;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#projectService = projectService;

    this.#abilityLayer = new AbilityLayer(compiler, this.#editor);
    this.#suppressedLayer = new SuppressedLayer(compiler, this.#editor, resolvedConfig);
  }

  close(tree: TestTree): void {
    const seenDiagnostics: Array<ts.Diagnostic> = this.#suppressedDiagnostics ?? [];
    this.#suppressedDiagnostics = undefined;

    const diagnostics = this.#projectService.getDiagnostics(this.#editor.getFilePath(), this.#editor.getText());
    const offsets = this.#editor.getOffsets();

    const abilityDiagnostics: Array<ts.Diagnostic> = [];

    if (diagnostics != null) {
      for (const diagnostic of diagnostics) {
        const mappedDiagnostic = new MappedDiagnostic(tree.sourceFile, diagnostic, offsets);

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

    this.#suppressedDiagnostics = this.#projectService.getDiagnostics(
      this.#editor.getFilePath(),
      this.#editor.getText(),
    );

    this.#suppressedLayer.close(
      this.#suppressedDiagnostics?.map((diagnostic) => new MappedDiagnostic(tree.sourceFile, diagnostic, [])),
    );
  }

  visit(node: ExpectNode): void {
    this.#abilityLayer.visitExpect(node);
  }
}

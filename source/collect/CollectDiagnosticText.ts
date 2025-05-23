export class CollectDiagnosticText {
  static cannotBeNestedWithin(source: string, target: string): string {
    return `'${source}()' cannot be nested within '${target}()'.`;
  }
}

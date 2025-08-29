export class FixmeDiagnosticText {
  static considerRemoving(): string {
    return "Consider removing the '// @tstyche fixme' directive.";
  }

  static wasSupposedToFail(target: string): string {
    return `The '${target}()' was supposed to fail, but it passed.`;
  }
}

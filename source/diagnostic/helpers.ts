import type ts from "typescript";

function diagnosticMessageChainToText(chain: ts.DiagnosticMessageChain) {
  const result = [chain.messageText];

  if (chain.next != null) {
    for (const nextChain of chain.next) {
      result.push(...diagnosticMessageChainToText(nextChain));
    }
  }

  return result;
}

export function getDiagnosticMessageText(diagnostic: ts.Diagnostic): string | Array<string> {
  return typeof diagnostic.messageText === "string"
    ? diagnostic.messageText
    : diagnosticMessageChainToText(diagnostic.messageText);
}

export function isDiagnosticWithLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticWithLocation {
  return diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
}

export function textRangeContainsDiagnostic(range: ts.TextRange, diagnostic: ts.Diagnostic): boolean {
  return diagnostic.start != null && diagnostic.start >= range.pos && diagnostic.start <= range.end;
}

export function textSpanEnd(span: ts.TextSpan): number {
  return span.start + span.length;
}

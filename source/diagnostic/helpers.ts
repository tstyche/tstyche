import type ts from "typescript";
import type { Node, NodeArray } from "#typescript";
import type { Offset } from "./types.js";

export function diagnosticBelongsToNode(diagnostic: ts.Diagnostic, node: NodeArray<Node> | Node): boolean {
  return diagnostic.start != null && diagnostic.start >= node.pos && diagnostic.start <= node.end;
}

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

export function getOffset(position: number, offsets: Array<Offset>): number {
  let diff = 0;

  for (const offset of offsets) {
    if (offset.position > position - diff) {
      break;
    }

    diff += offset.diff;
  }

  return diff;
}

export function getTextSpanEnd(span: ts.TextSpan): number {
  return span.start + span.length;
}

export function isDiagnosticWithLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticWithLocation {
  return diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
}

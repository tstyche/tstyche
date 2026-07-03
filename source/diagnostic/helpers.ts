import type * as ts from "#typescript";
import type { Node, NodeArray } from "#typescript";
import type { Offset } from "./types.js";

export function diagnosticBelongsToNode(diagnostic: ts.Diagnostic, node: NodeArray<Node> | Node): boolean {
  if (isDiagnosticPosition(diagnostic)) {
    return diagnostic.pos >= node.pos && diagnostic.pos <= node.end;
  }

  if (isDiagnosticLocation(diagnostic)) {
    return diagnostic.start >= node.pos && diagnostic.start <= node.end;
  }

  return false;
}

interface CompatDiagnosticChain {
  messageText: string;
  next?: Array<CompatDiagnosticChain> | undefined;
}

interface NativeDiagnosticChain {
  text: string;
  messageChain?: ReadonlyArray<NativeDiagnosticChain> | undefined;
}

function flattenDiagnosticText(diagnostic: NativeDiagnosticChain | CompatDiagnosticChain): Array<string> {
  let text: string;
  let messageChain: ReadonlyArray<NativeDiagnosticChain | CompatDiagnosticChain> | undefined;

  if ("text" in diagnostic) {
    text = diagnostic.text;
    messageChain = diagnostic.messageChain;
  } else {
    text = diagnostic.messageText;
    messageChain = diagnostic.next;
  }

  const result = [text];

  if (messageChain != null) {
    for (const message of messageChain) {
      result.push(...flattenDiagnosticText(message));
    }
  }

  return result;
}

export function getDiagnosticMessageText(diagnostic: ts.Diagnostic): Array<string> {
  if ("text" in diagnostic) {
    return flattenDiagnosticText(diagnostic);
  }

  return typeof diagnostic.messageText === "string"
    ? [diagnostic.messageText]
    : flattenDiagnosticText(diagnostic.messageText);
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

export function isDiagnosticLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticLocation {
  return "file" in diagnostic && diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
}

export function isDiagnosticPosition(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticPosition {
  return "fileName" in diagnostic && diagnostic.fileName != null && diagnostic.pos != null && diagnostic.end != null;
}

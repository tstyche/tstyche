import type * as ts from "#typescript";

export function compareDiagnostics(a: ts.Diagnostic, b: ts.Diagnostic): boolean {
  if (isDiagnosticPosition(a) && isDiagnosticPosition(b)) {
    if (a.fileName !== b.fileName) {
      return false;
    }

    return deepCompareKeys(a, b, ["pos", "end", "code", "text"]);
  }

  if (isDiagnosticLocation(a) && isDiagnosticLocation(b)) {
    if (a.file?.fileName !== b.file?.fileName) {
      return false;
    }

    return deepCompareKeys(a, b, ["start", "length", "code", "messageText"]);
  }

  return false;
}

function deepCompareKeys(a: any, b: any, keys: Array<string>): boolean {
  if (a == null || b == null) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object") {
    return a === b;
  }

  for (const key of Object.keys(a).filter((key) => keys.includes(key))) {
    if (!(key in b) || !deepCompareKeys(a[key], b[key], keys)) {
      return false;
    }
  }

  return true;
}

export function diagnosticBelongsToNode(diagnostic: ts.Diagnostic, node: ts.NodeArray<ts.Node> | ts.Node): boolean {
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

export function isDiagnosticLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticLocation {
  return "file" in diagnostic && diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
}

export function isDiagnosticPosition(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticPosition {
  return "fileName" in diagnostic && diagnostic.fileName != null && diagnostic.pos != null && diagnostic.end != null;
}

import type * as ast from "@typescript/native-preview/unstable/ast";
import type ts from "typescript";
import type { CompatTypeScript } from "./CompatTypeScript.js";
import type { NativeTypeScript } from "./NativeTypeScript.js";

export type CommentRange = ast.CommentRange | ts.CommentRange;
export type Node = ast.Node | ts.Node;
export type SourceFile = ast.SourceFile | ts.SourceFile;

export type TypeScript = NativeTypeScript | CompatTypeScript;

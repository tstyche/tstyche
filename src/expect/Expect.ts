import type ts from "typescript/lib/tsserverlibrary.js";
import type { Assertion } from "#collect";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import type { ExpectResult } from "#result";
import { PrimitiveTypeMatcher } from "./PrimitiveTypeMatcher.js";
import { ToBeAssignable } from "./ToBeAssignable.js";
import { ToBeCallableWith } from "./ToBeCallableWith.js";
import { ToEqual } from "./ToEqual.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToMatch } from "./ToMatch.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class Expect {
  toBeAny: PrimitiveTypeMatcher;
  toBeAssignable: ToBeAssignable;
  toBeBigInt: PrimitiveTypeMatcher;
  toBeBoolean: PrimitiveTypeMatcher;
  toBeCallableWith: ToBeCallableWith;
  toBeNever: PrimitiveTypeMatcher;
  toBeNull: PrimitiveTypeMatcher;
  toBeNumber: PrimitiveTypeMatcher;
  toBeString: PrimitiveTypeMatcher;
  toBeSymbol: PrimitiveTypeMatcher;
  toBeUndefined: PrimitiveTypeMatcher;
  toBeUniqueSymbol: PrimitiveTypeMatcher;
  toBeUnknown: PrimitiveTypeMatcher;
  toBeVoid: PrimitiveTypeMatcher;
  toEqual: ToEqual;
  toHaveProperty: ToHaveProperty;
  toMatch: ToMatch;
  toRaiseError: ToRaiseError;

  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {
    this.toBeAny = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Any, "any");
    this.toBeAssignable = new ToBeAssignable(this.typeChecker);
    this.toBeBigInt = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.BigInt, "bigint");
    this.toBeBoolean = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Boolean, "boolean");
    this.toBeCallableWith = new ToBeCallableWith(this.compiler, this.typeChecker);
    this.toBeNever = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Never, "never");
    this.toBeNull = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Null, "null");
    this.toBeNumber = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Number, "number");
    this.toBeString = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.String, "string");
    this.toBeSymbol = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.ESSymbol, "symbol");
    this.toBeUndefined = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Undefined, "undefined");
    this.toBeUniqueSymbol = new PrimitiveTypeMatcher(
      this.typeChecker,
      this.compiler.TypeFlags.UniqueESSymbol,
      "unique symbol",
    );
    this.toBeUnknown = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Unknown, "unknown");
    this.toBeVoid = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Void, "void");
    this.toEqual = new ToEqual(this.typeChecker);
    this.toHaveProperty = new ToHaveProperty(this.compiler, this.typeChecker);
    this.toMatch = new ToMatch(this.typeChecker);
    this.toRaiseError = new ToRaiseError(this.compiler, this.typeChecker);
  }

  static assertTypeChecker(typeChecker: ts.TypeChecker): typeChecker is TypeChecker {
    return (
      "isTypeAssignableTo" in typeChecker && "isTypeIdenticalTo" in typeChecker && "isTypeSubtypeOf" in typeChecker
    );
  }

  #getType(node: ts.Expression | ts.TypeNode) {
    return this.compiler.isExpression(node)
      ? this.typeChecker.getTypeAtLocation(node)
      : this.typeChecker.getTypeFromTypeNode(node);
  }

  #getTypes(nodes: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>) {
    return nodes.map((node) => this.#getType(node));
  }

  #isArrayOfStringOrNumberLiteralTypes(
    types: Array<ts.Type>,
  ): types is Array<ts.StringLiteralType | ts.NumberLiteralType> {
    return types.every((type) => this.#isStringOrNumberLiteralType(type));
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringOrNumberLiteral);
  }

  #isUniqueSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return Boolean(type.flags & this.compiler.TypeFlags.UniqueESSymbol);
  }

  match(assertion: Assertion, expectResult: ExpectResult): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    switch (matcherNameText) {
      case "toBeAssignable":
      case "toEqual":
      case "toMatch":
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onTargetArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(
          this.#getType(assertion.source[0]),
          this.#getType(assertion.target[0]),
          assertion.isNot,
        );

      case "toBeAny":
      case "toBeBigInt":
      case "toBeBoolean":
      case "toBeNever":
      case "toBeNull":
      case "toBeNumber":
      case "toBeString":
      case "toBeSymbol":
      case "toBeUndefined":
      case "toBeUniqueSymbol":
      case "toBeUnknown":
      case "toBeVoid":
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(this.#getType(assertion.source[0]), assertion.isNot);

      case "toBeCallableWith": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const sourceType = this.#getType(assertion.source[0]);
        const signatures = sourceType.getCallSignatures();

        if (signatures.length === 0) {
          const sourceTypeText = this.typeChecker.typeToString(sourceType);

          console.log("This expression is not callable.", `Type '${sourceTypeText}' has no call signatures.`);
        }

        let targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember> = [];

        if (assertion.target[0] != null) {
          if (this.compiler.isExpression(assertion.target[0])) {
            targetNodes = [...(assertion.target as ts.NodeArray<ts.Expression>)];
          }

          if (this.compiler.isTypeNode(assertion.target[0])) {
            if (this.compiler.isTupleTypeNode(assertion.target[0])) {
              targetNodes = [...assertion.target[0].elements];
            } else {
              const receivedTypeText = this.typeChecker.typeToString(this.#getType(assertion.target[0]));

              console.log(`A type argument for 'Target' must be of tuple type, received: '${receivedTypeText}'.`);
            }
          }
        }

        return this.toBeCallableWith.match({ node: assertion.source[0], signatures }, targetNodes, assertion.isNot);
      }

      case "toHaveProperty": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const sourceType = this.#getType(assertion.source[0]);
        const nonPrimitiveType = { flags: this.compiler.TypeFlags.NonPrimitive } as ts.Type; // the intrinsic 'object' type

        if (
          sourceType.flags & (this.compiler.TypeFlags.Any | this.compiler.TypeFlags.Never) ||
          !this.typeChecker.isTypeAssignableTo(sourceType, nonPrimitiveType)
        ) {
          this.#onSourceArgumentMustBeObjectType(assertion.source[0], expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onKeyArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const targetType = this.#getType(assertion.target[0]);

        if (!(this.#isStringOrNumberLiteralType(targetType) || this.#isUniqueSymbolType(targetType))) {
          this.#onKeyArgumentMustBeOfType(assertion.target[0], expectResult);

          return;
        }

        return this.toHaveProperty.match(sourceType, targetType, assertion.isNot);
      }

      case "toRaiseError": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const targetTypes = this.#getTypes(assertion.target);

        if (!this.#isArrayOfStringOrNumberLiteralTypes(targetTypes)) {
          this.#onTargetArgumentsMustBeStringOrNumberLiteralTypes(assertion.target, expectResult);

          return;
        }

        return this.toRaiseError.match(
          { diagnostics: assertion.diagnostics, node: assertion.source[0] },
          targetTypes,
          assertion.isNot,
        );
      }

      default:
        this.#onNotSupportedMatcherName(assertion, expectResult);

        return;
    }
  }

  #onKeyArgumentMustBeOfType(node: ts.Expression | ts.TypeNode, expectResult: ExpectResult) {
    const receivedTypeText = this.typeChecker.typeToString(this.#getType(node));

    const text = `An argument for 'key' must be of type 'string | number | symbol', received: '${receivedTypeText}'.`;
    const origin = {
      end: node.getEnd(),
      file: node.getSourceFile(),
      start: node.getStart(),
    };

    EventEmitter.dispatch(["expect:error", { diagnostics: [Diagnostic.error(text, origin)], result: expectResult }]);
  }

  #onKeyArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [Diagnostic.error("An argument for 'key' must be provided.", origin)],
        result: expectResult,
      },
    ]);
  }

  #onNotSupportedMatcherName(assertion: Assertion, expectResult: ExpectResult) {
    const matcherNameText = assertion.matcherName.getText();
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [Diagnostic.error(`The '${matcherNameText}()' matcher is not supported.`, origin)],
        result: expectResult,
      },
    ]);
  }

  #onSourceArgumentMustBeObjectType(node: ts.Expression | ts.TypeNode, expectResult: ExpectResult) {
    const sourceText = this.compiler.isTypeNode(node) ? "A type argument for 'Source'" : "An argument for 'source'";
    const receivedTypeText = this.typeChecker.typeToString(this.#getType(node));

    const text = `${sourceText} must be of an object type, received: '${receivedTypeText}'.`;
    const origin = {
      end: node.getEnd(),
      file: node.getSourceFile(),
      start: node.getStart(),
    };

    EventEmitter.dispatch(["expect:error", { diagnostics: [Diagnostic.error(text, origin)], result: expectResult }]);
  }

  #onSourceArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.node.getEnd(),
      file: assertion.node.getSourceFile(),
      start: assertion.node.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'source' or type argument for 'Source' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }

  #onTargetArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'target' or type argument for 'Target' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }

  #onTargetArgumentsMustBeStringOrNumberLiteralTypes(
    nodes: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>,
    expectResult: ExpectResult,
  ) {
    const diagnostics: Array<Diagnostic> = [];

    for (const node of nodes) {
      const receivedType = this.#getType(node);

      if (!this.#isStringOrNumberLiteralType(receivedType)) {
        const receivedTypeText = this.typeChecker.typeToString(this.#getType(node));

        const origin = {
          end: node.getEnd(),
          file: node.getSourceFile(),
          start: node.getStart(),
        };

        diagnostics.push(
          Diagnostic.error(
            `An argument for 'target' must be of type 'string | number', received: '${receivedTypeText}'.`,
            origin,
          ),
        );
      }
    }

    EventEmitter.dispatch(["expect:error", { diagnostics, result: expectResult }]);
  }
}

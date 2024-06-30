import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { Path } from "#path";
import type { StoreService } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import {
  type ItemDefinition,
  type OptionDefinition,
  OptionDefinitionsMap,
  type OptionValue,
} from "./OptionDefinitionsMap.js";
import { OptionValidator } from "./OptionValidator.js";
import { OptionBrand, OptionGroup } from "./enums.js";

export type { ConfigFileOptions } from "../../models/ConfigFileOptions.js";

export class ConfigFileOptionsWorker {
  #compiler: typeof ts;
  #configFileOptionDefinitions: Map<string, OptionDefinition>;
  #configFileOptions: Record<string, OptionValue>;
  #configFilePath: string;
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #optionGroup = OptionGroup.ConfigFile;
  #optionValidator: OptionValidator;
  #storeService: StoreService;

  constructor(
    compiler: typeof ts,
    configFileOptions: Record<string, OptionValue>,
    configFilePath: string,
    storeService: StoreService,
    onDiagnostic: (diagnostic: Diagnostic) => void,
  ) {
    this.#compiler = compiler;
    this.#configFileOptions = configFileOptions;
    this.#configFilePath = configFilePath;
    this.#storeService = storeService;
    this.#onDiagnostic = onDiagnostic;

    this.#configFileOptionDefinitions = OptionDefinitionsMap.for(this.#optionGroup);

    this.#optionValidator = new OptionValidator(this.#optionGroup, this.#storeService, this.#onDiagnostic);
  }

  #isDoubleQuotedString(node: ts.Node, sourceFile: ts.SourceFile): boolean {
    return (
      node.kind === this.#compiler.SyntaxKind.StringLiteral &&
      sourceFile.text.slice(this.#skipTrivia(node.pos, sourceFile), node.end).startsWith('"')
    );
  }

  async parse(sourceText: string): Promise<void> {
    const sourceFile = this.#compiler.parseJsonText(this.#configFilePath, sourceText) as ts.JsonSourceFile & {
      parseDiagnostics: Array<ts.Diagnostic>;
    };

    if (sourceFile.parseDiagnostics.length > 0) {
      for (const diagnostic of Diagnostic.fromDiagnostics(sourceFile.parseDiagnostics, this.#compiler)) {
        this.#onDiagnostic(diagnostic);
      }

      return;
    }

    const rootExpression = sourceFile.statements[0]?.expression;

    if (rootExpression == null || !this.#compiler.isObjectLiteralExpression(rootExpression)) {
      const origin = new DiagnosticOrigin(0, 0, sourceFile);

      this.#onDiagnostic(Diagnostic.error("The root value of a configuration file must be an object literal.", origin));

      return;
    }

    for (const property of rootExpression.properties) {
      if (this.#compiler.isPropertyAssignment(property)) {
        if (!this.#isDoubleQuotedString(property.name, sourceFile)) {
          const origin = DiagnosticOrigin.fromJsonNode(property.name, sourceFile, this.#skipTrivia);

          this.#onDiagnostic(Diagnostic.error(ConfigDiagnosticText.doubleQuotesExpected(), origin));
          continue;
        }

        const optionName = this.#resolvePropertyName(property);

        if (optionName === "$schema") {
          continue;
        }

        const optionDefinition = this.#configFileOptionDefinitions.get(optionName);

        if (optionDefinition) {
          this.#configFileOptions[optionDefinition.name] = await this.#parseOptionValue(
            sourceFile,
            property.initializer,
            optionDefinition,
          );
        } else {
          const origin = DiagnosticOrigin.fromJsonNode(property.name, sourceFile, this.#skipTrivia);

          this.#onDiagnostic(Diagnostic.error(ConfigDiagnosticText.unknownOption(optionName), origin));
        }
      }
    }

    return;
  }

  async #parseOptionValue(
    sourceFile: ts.SourceFile,
    valueExpression: ts.Expression,
    optionDefinition: OptionDefinition | ItemDefinition,
    isListItem = false,
  ): Promise<OptionValue> {
    switch (valueExpression.kind) {
      case this.#compiler.SyntaxKind.TrueKeyword: {
        if (optionDefinition.brand === OptionBrand.Boolean) {
          return true;
        }
        break;
      }

      case this.#compiler.SyntaxKind.FalseKeyword: {
        if (optionDefinition.brand === OptionBrand.Boolean) {
          return false;
        }
        break;
      }

      case this.#compiler.SyntaxKind.StringLiteral: {
        if (!this.#isDoubleQuotedString(valueExpression, sourceFile)) {
          const origin = DiagnosticOrigin.fromJsonNode(valueExpression, sourceFile, this.#skipTrivia);

          this.#onDiagnostic(Diagnostic.error(ConfigDiagnosticText.doubleQuotesExpected(), origin));
          return;
        }

        if (optionDefinition.brand === OptionBrand.String) {
          let value = (valueExpression as ts.StringLiteral).text;

          if (optionDefinition.name === "rootPath") {
            value = Path.resolve(Path.dirname(this.#configFilePath), value);
          }

          const origin = DiagnosticOrigin.fromJsonNode(valueExpression, sourceFile, this.#skipTrivia);

          await this.#optionValidator.check(optionDefinition.name, value, optionDefinition.brand, origin);

          return value;
        }
        break;
      }

      case this.#compiler.SyntaxKind.ArrayLiteralExpression: {
        if (optionDefinition.brand === OptionBrand.List) {
          const value: Array<OptionValue> = [];

          for (const element of (valueExpression as ts.ArrayLiteralExpression).elements) {
            value.push(
              await this.#parseOptionValue(sourceFile, element, optionDefinition.items, /* isListItem */ true),
            );
          }

          return value;
        }
        break;
      }

      default:
        break;
    }

    const text = isListItem
      ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
      : ConfigDiagnosticText.requiresValueType(optionDefinition.name, optionDefinition.brand, this.#optionGroup);
    const origin = DiagnosticOrigin.fromJsonNode(valueExpression, sourceFile, this.#skipTrivia);

    this.#onDiagnostic(Diagnostic.error(text, origin));

    return;
  }

  #resolvePropertyName({ name }: ts.PropertyAssignment) {
    if ("text" in name) {
      return name.text;
    }

    return "";
  }

  #skipTrivia(this: void, position: number, sourceFile: ts.SourceFile) {
    const { text } = sourceFile.getSourceFile();

    while (position < text.length) {
      if (/\s/.test(text.charAt(position))) {
        position++;

        continue;
      }

      if (text.charAt(position) === "/") {
        if (text.charAt(position + 1) === "/") {
          position += 2;

          while (position < text.length) {
            if (text.charAt(position) === "\n") {
              break;
            }
            position++;
          }

          continue;
        }

        if (text.charAt(position + 1) === "*") {
          position += 2;

          while (position < text.length) {
            if (text.charAt(position) === "*" && text.charAt(position + 1) === "/") {
              position += 2;
              break;
            }
            position++;
          }

          continue;
        }

        position++;

        continue;
      }

      break;
    }

    return position;
  }
}

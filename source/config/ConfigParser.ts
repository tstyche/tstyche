import type ts from "typescript";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { Path } from "#path";
import type { SourceFile } from "#source";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import type { JsonNode } from "./JsonNode.js";
import type { JsonScanner } from "./JsonScanner.js";
import { OptionBrand } from "./OptionBrand.enum.js";
import type { OptionGroup } from "./OptionGroup.enum.js";
import { type ItemDefinition, type OptionDefinition, Options } from "./Options.js";
import { Target } from "./Target.js";
import type { OptionValue } from "./types.js";

export class ConfigParser {
  #configFileOptions: Record<string, OptionValue>;
  #jsonScanner: JsonScanner;
  #onDiagnostics: DiagnosticsHandler;
  #options: Map<string, OptionDefinition>;
  #sourceFile: SourceFile | ts.SourceFile;

  constructor(
    configOptions: Record<string, OptionValue>,
    optionGroup: OptionGroup,
    sourceFile: SourceFile | ts.SourceFile,
    jsonScanner: JsonScanner,
    onDiagnostics: DiagnosticsHandler,
  ) {
    this.#configFileOptions = configOptions;
    this.#jsonScanner = jsonScanner;
    this.#onDiagnostics = onDiagnostics;
    this.#sourceFile = sourceFile;

    this.#options = Options.for(optionGroup);
  }

  #onRequiresValue(optionDefinition: OptionDefinition | ItemDefinition, jsonNode: JsonNode, isListItem: boolean) {
    const text = isListItem
      ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
      : ConfigDiagnosticText.optionValueMustBe(optionDefinition.name, optionDefinition.brand);

    this.#onDiagnostics(Diagnostic.error(text, jsonNode.origin));
  }

  async #parseValue(optionDefinition: OptionDefinition | ItemDefinition, isListItem = false) {
    let jsonNode: JsonNode;
    let optionValue: OptionValue;

    switch (optionDefinition.brand) {
      case OptionBrand.Boolean: {
        jsonNode = this.#jsonScanner.read();
        optionValue = jsonNode.getValue();

        if (typeof optionValue !== "boolean") {
          this.#onRequiresValue(optionDefinition, jsonNode, isListItem);
          break;
        }

        break;
      }

      case OptionBrand.String: {
        jsonNode = this.#jsonScanner.read();
        optionValue = jsonNode.getValue();

        if (typeof optionValue !== "string") {
          this.#onRequiresValue(optionDefinition, jsonNode, isListItem);
          break;
        }

        const rootPath = Path.dirname(this.#sourceFile.fileName);
        optionValue = Options.resolve(optionDefinition.name, optionValue, rootPath);

        await Options.validate(
          optionDefinition.name,
          optionValue,
          optionDefinition.brand,
          this.#onDiagnostics,
          jsonNode.origin,
        );

        break;
      }

      case OptionBrand.SemverRange: {
        jsonNode = this.#jsonScanner.read();
        optionValue = jsonNode.getValue();

        if (typeof optionValue !== "string") {
          this.#onRequiresValue(optionDefinition, jsonNode, isListItem);
          break;
        }

        optionValue = await Target.expand(optionValue);

        break;
      }

      case OptionBrand.List: {
        optionValue = [];

        const leftBracketToken = this.#jsonScanner.readToken("[");

        if (!leftBracketToken.text) {
          jsonNode = this.#jsonScanner.read();

          this.#onRequiresValue(optionDefinition, jsonNode, isListItem);

          break;
        }

        while (!this.#jsonScanner.isRead()) {
          if (this.#jsonScanner.peekToken("]")) {
            break;
          }

          const item = await this.#parseValue(optionDefinition.items, /* isListItem */ true);

          if (item != null) {
            optionValue.push(item);
          }

          const commaToken = this.#jsonScanner.readToken(",");

          if (!commaToken.text) {
            break;
          }
        }

        const rightBracketToken = this.#jsonScanner.readToken("]");

        if (!rightBracketToken.text) {
          const text = ConfigDiagnosticText.expected("closing ']'");
          const relatedText = ConfigDiagnosticText.seen("opening '['");

          const diagnostic = Diagnostic.error(text, rightBracketToken.origin).add({
            related: [Diagnostic.error(relatedText, leftBracketToken.origin)],
          });

          this.#onDiagnostics(diagnostic);
        }

        break;
      }
    }

    return optionValue;
  }

  async #parseObject() {
    const leftBraceToken = this.#jsonScanner.readToken("{");

    if (this.#jsonScanner.isRead()) {
      return;
    }

    if (!leftBraceToken.text) {
      const text = ConfigDiagnosticText.expected("'{'");

      this.#onDiagnostics(Diagnostic.error(text, leftBraceToken.origin));

      return;
    }

    while (!this.#jsonScanner.isRead()) {
      if (this.#jsonScanner.peekToken("}")) {
        break;
      }

      const optionNameNode = this.#jsonScanner.read();

      const optionName = optionNameNode.getValue({ expectsIdentifier: true });

      if (!optionName) {
        const text = ConfigDiagnosticText.expected("option name");

        this.#onDiagnostics(Diagnostic.error(text, optionNameNode.origin));

        return;
      }

      const optionDefinition = this.#options.get(optionName);

      if (!optionDefinition) {
        const text = ConfigDiagnosticText.unknownOption(optionName);

        this.#onDiagnostics(Diagnostic.error(text, optionNameNode.origin));

        this.#jsonScanner.readToken(":");
        this.#jsonScanner.read();

        const commaToken = this.#jsonScanner.readToken(",");

        if (!commaToken.text) {
          break;
        }

        continue;
      }

      if (this.#jsonScanner.peekToken(":")) {
        this.#jsonScanner.readToken(":");
      }

      const parsedValue = await this.#parseValue(optionDefinition);

      if (optionDefinition.name !== "$schema") {
        this.#configFileOptions[optionDefinition.name] = parsedValue;
      }

      const commaToken = this.#jsonScanner.readToken(",");

      if (!commaToken.text) {
        break;
      }
    }

    const rightBraceToken = this.#jsonScanner.readToken("}");

    if (!rightBraceToken.text) {
      const text = ConfigDiagnosticText.expected("closing '}'");
      const relatedText = ConfigDiagnosticText.seen("opening '{'");

      const diagnostic = Diagnostic.error(text, rightBraceToken.origin).add({
        related: [Diagnostic.error(relatedText, leftBraceToken.origin)],
      });

      this.#onDiagnostics(diagnostic);

      return;
    }

    const unexpectedToken = this.#jsonScanner.readToken(/\S/);

    if (unexpectedToken.text != null) {
      const text = ConfigDiagnosticText.unexpected("token");
      const diagnostic = Diagnostic.error(text, unexpectedToken.origin);

      this.#onDiagnostics(diagnostic);
    }
  }

  async parse(): Promise<void> {
    await this.#parseObject();
  }
}

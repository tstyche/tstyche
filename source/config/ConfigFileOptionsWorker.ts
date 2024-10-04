import { Diagnostic, type SourceFile } from "#diagnostic";
import { Path } from "#path";
import type { StoreService } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import type { JsonNode } from "./JsonNode.js";
import { JsonScanner } from "./JsonScanner.js";
import { OptionBrand } from "./OptionBrand.enum.js";
import { type ItemDefinition, type OptionDefinition, OptionDefinitionsMap } from "./OptionDefinitionsMap.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { OptionValidator } from "./OptionValidator.js";
import type { DiagnosticsHandler, OptionValue } from "./types.js";

export class ConfigFileOptionsWorker {
  #configFileOptionDefinitions: Map<string, OptionDefinition>;
  #configFileOptions: Record<string, OptionValue>;
  #jsonScanner: JsonScanner;
  #onDiagnostics: DiagnosticsHandler;
  #optionGroup = OptionGroup.ConfigFile;
  #optionValidator: OptionValidator;
  #sourceFile: SourceFile;
  #storeService: StoreService;

  constructor(
    configFileOptions: Record<string, OptionValue>,
    sourceFile: SourceFile,
    storeService: StoreService,
    onDiagnostics: DiagnosticsHandler,
  ) {
    this.#configFileOptions = configFileOptions;
    this.#sourceFile = sourceFile;
    this.#storeService = storeService;
    this.#onDiagnostics = onDiagnostics;

    this.#configFileOptionDefinitions = OptionDefinitionsMap.for(this.#optionGroup);

    this.#jsonScanner = new JsonScanner(this.#sourceFile);
    this.#optionValidator = new OptionValidator(this.#optionGroup, this.#storeService, this.#onDiagnostics);
  }

  #onRequiresValue(optionDefinition: OptionDefinition | ItemDefinition, jsonNode: JsonNode, isListItem: boolean) {
    const text = isListItem
      ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
      : ConfigDiagnosticText.requiresValueType(optionDefinition.name, optionDefinition.brand, this.#optionGroup);

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

        if (optionDefinition.name === "rootPath") {
          optionValue = Path.resolve(Path.dirname(this.#sourceFile.fileName), optionValue);
        }

        await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand, jsonNode.origin);

        break;
      }

      case OptionBrand.List: {
        const leftBracketToken = this.#jsonScanner.readToken("[");

        if (!leftBracketToken.text) {
          jsonNode = this.#jsonScanner.skip();

          this.#onRequiresValue(optionDefinition, jsonNode, isListItem);

          break;
        }

        optionValue = [];

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
            // TODO can be Info, since this is not an error
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

      const optionDefinition = this.#configFileOptionDefinitions.get(optionName);

      if (!optionDefinition) {
        const text = ConfigDiagnosticText.unknownOption(optionName);

        this.#onDiagnostics(Diagnostic.error(text, optionNameNode.origin));

        if (this.#jsonScanner.readToken(":")) {
          this.#jsonScanner.skip();
        }

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
        // TODO can be Info, since this is not an error
        related: [Diagnostic.error(relatedText, leftBraceToken.origin)],
      });

      this.#onDiagnostics(diagnostic);
    }
  }

  async parse(): Promise<void> {
    await this.#parseObject();
  }
}

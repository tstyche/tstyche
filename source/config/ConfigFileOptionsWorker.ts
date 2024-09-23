import { Diagnostic, type SourceFile } from "#diagnostic";
import { Path } from "#path";
import type { StoreService } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import { type JsonElement, JsonScanner } from "./JsonScanner.js";
import {
  type ItemDefinition,
  type OptionDefinition,
  OptionDefinitionsMap,
  type OptionValue,
} from "./OptionDefinitionsMap.js";
import { OptionValidator } from "./OptionValidator.js";
import { OptionBrand, OptionGroup } from "./enums.js";
import type { DiagnosticsHandler } from "./types.js";

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

  #onRequiresValue(optionDefinition: OptionDefinition | ItemDefinition, jsonElement: JsonElement, isListItem: boolean) {
    const text = isListItem
      ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
      : ConfigDiagnosticText.requiresValueType(optionDefinition.name, optionDefinition.brand, this.#optionGroup);

    this.#onDiagnostics(Diagnostic.error(text, jsonElement.origin));
  }

  async #parseValue(optionDefinition: OptionDefinition | ItemDefinition, isListItem = false) {
    let jsonElement: JsonElement;
    let parsedValue: OptionValue;

    switch (optionDefinition.brand) {
      case OptionBrand.Boolean: {
        jsonElement = this.#jsonScanner.read();

        if (typeof jsonElement.value !== "boolean") {
          this.#onRequiresValue(optionDefinition, jsonElement, isListItem);
          break;
        }

        parsedValue = jsonElement.value;

        break;
      }

      case OptionBrand.String: {
        jsonElement = this.#jsonScanner.read();

        if (typeof jsonElement.value !== "string") {
          this.#onRequiresValue(optionDefinition, jsonElement, isListItem);
          break;
        }

        parsedValue = jsonElement.value;

        if (optionDefinition.name === "rootPath") {
          parsedValue = Path.resolve(Path.dirname(this.#sourceFile.fileName), jsonElement.value);
        }

        await this.#optionValidator.check(
          optionDefinition.name,
          parsedValue,
          optionDefinition.brand,
          jsonElement.origin,
        );

        break;
      }

      case OptionBrand.List: {
        const leftBracketToken = this.#jsonScanner.readToken("[");

        if (!leftBracketToken.value) {
          // TODO check if object type is handled here
          jsonElement = this.#jsonScanner.read();

          this.#onRequiresValue(optionDefinition, jsonElement, isListItem);
          break;
        }

        parsedValue = [];

        while (!this.#jsonScanner.isRead()) {
          if (this.#jsonScanner.peekToken("]")) {
            break;
          }

          const item = await this.#parseValue(optionDefinition.items, /* isListItem */ true);

          if (item != null) {
            parsedValue.push(item);
          }

          const commaToken = this.#jsonScanner.readToken(",");

          if (!commaToken.value) {
            break;
          }
        }

        const rightBracketToken = this.#jsonScanner.readToken("]");

        if (!rightBracketToken.value) {
          const text = ConfigDiagnosticText.expectedJsonElement("closing ']'");
          const relatedText = ConfigDiagnosticText.seenJsonElement("opening '['");

          const diagnostic = Diagnostic.error(text, rightBracketToken.origin).add({
            // TODO can be Info, since this is not an error
            related: [Diagnostic.error(relatedText, leftBracketToken.origin)],
          });

          this.#onDiagnostics(diagnostic);
        }

        break;
      }
    }

    return parsedValue;
  }

  async #parseObject() {
    const leftBraceToken = this.#jsonScanner.readToken("{");

    if (this.#jsonScanner.isRead()) {
      return;
    }

    if (!leftBraceToken.value) {
      const text = ConfigDiagnosticText.expectedJsonElement("'{'");

      this.#onDiagnostics(Diagnostic.error(text, leftBraceToken.origin));

      return;
    }

    while (!this.#jsonScanner.isRead()) {
      if (this.#jsonScanner.peekToken("}")) {
        break;
      }

      const optionNameElement = this.#jsonScanner.read();

      const optionName = optionNameElement.value?.toString();

      if (!optionName) {
        const text = ConfigDiagnosticText.expectedJsonElement("option name");

        this.#onDiagnostics(Diagnostic.error(text, optionNameElement.origin));

        return;
      }

      const optionDefinition = this.#configFileOptionDefinitions.get(optionName);

      if (!optionDefinition) {
        const text = ConfigDiagnosticText.unknownOption(optionName);

        this.#onDiagnostics(Diagnostic.error(text, optionNameElement.origin));

        if (this.#jsonScanner.readToken(":")) {
          // TODO might not read list
          this.#jsonScanner.read();
        }

        const commaToken = this.#jsonScanner.readToken(",");

        if (!commaToken.value) {
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

      if (!commaToken.value) {
        break;
      }
    }

    const rightBraceToken = this.#jsonScanner.readToken("}");

    if (!rightBraceToken.value) {
      const text = ConfigDiagnosticText.expectedJsonElement("closing '}'");
      const relatedText = ConfigDiagnosticText.seenJsonElement("opening '{'");

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

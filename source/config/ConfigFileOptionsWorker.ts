import { Diagnostic, type DiagnosticOrigin, type SourceFile } from "#diagnostic";
import { Path } from "#path";
import type { StoreService } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import { JsonScanner } from "./JsonScanner.js";
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

  #parse(text: string) {
    if (/^['"]/.test(text)) {
      return text.slice(1, -1);
    }

    if (text === "true") {
      return true;
    }

    if (text === "false") {
      return false;
    }

    if (/^\d/.test(text)) {
      return Number.parseFloat(text);
    }

    return text;
  }

  #onRequiresValue(
    optionDefinition: OptionDefinition | ItemDefinition,
    optionValue: { origin: DiagnosticOrigin; text: string | undefined },
    isListItem: boolean,
  ) {
    const text = isListItem
      ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
      : ConfigDiagnosticText.requiresValueType(optionDefinition.name, optionDefinition.brand, this.#optionGroup);

    this.#onDiagnostics(Diagnostic.error(text, optionValue.origin));
  }

  async #parseValue(optionDefinition: OptionDefinition | ItemDefinition, isListItem = false) {
    let optionValue: { origin: DiagnosticOrigin; text: string | undefined } | undefined;
    let parsedValue: OptionValue;

    switch (optionDefinition.brand) {
      case OptionBrand.Boolean: {
        optionValue = this.#jsonScanner.read();

        if (optionValue.text != null) {
          parsedValue = this.#parse(optionValue.text);
        }

        if (typeof parsedValue !== "boolean") {
          this.#onRequiresValue(optionDefinition, optionValue, isListItem);
          break;
        }

        break;
      }

      case OptionBrand.String: {
        optionValue = this.#jsonScanner.read();

        if (optionValue.text != null) {
          parsedValue = this.#parse(optionValue.text);
        }

        if (typeof parsedValue !== "string") {
          this.#onRequiresValue(optionDefinition, optionValue, isListItem);
          break;
        }

        if (optionDefinition.name === "rootPath") {
          parsedValue = Path.resolve(Path.dirname(this.#sourceFile.fileName), parsedValue);
        }

        await this.#optionValidator.check(
          optionDefinition.name,
          parsedValue,
          optionDefinition.brand,
          optionValue.origin,
        );

        break;
      }

      case OptionBrand.List: {
        parsedValue = [];

        const leftBracketToken = this.#jsonScanner.readToken("[");

        if (!leftBracketToken.value) {
          optionValue = this.#jsonScanner.read();

          this.#onRequiresValue(optionDefinition, optionValue, isListItem);
          break;
        }

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

      const optionName = this.#jsonScanner.read();

      if (!optionName.text) {
        // TODO should emit some diagnostic, perhaps?
        continue;
      }

      const optionNameText = this.#parse(optionName.text).toString();

      const optionDefinition = this.#configFileOptionDefinitions.get(optionNameText);

      if (!optionDefinition) {
        this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.unknownOption(optionNameText), optionName.origin));

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

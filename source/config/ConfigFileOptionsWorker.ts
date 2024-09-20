import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
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
  #configFilePath: string;
  #jsonScanner: JsonScanner;
  #onDiagnostics: DiagnosticsHandler;
  #optionGroup = OptionGroup.ConfigFile;
  #optionValidator: OptionValidator;
  #storeService: StoreService;

  constructor(
    configFileOptions: Record<string, OptionValue>,
    configFilePath: string,
    storeService: StoreService,
    onDiagnostics: DiagnosticsHandler,
  ) {
    this.#configFileOptions = configFileOptions;
    this.#configFilePath = configFilePath;
    this.#storeService = storeService;
    this.#onDiagnostics = onDiagnostics;

    this.#configFileOptionDefinitions = OptionDefinitionsMap.for(this.#optionGroup);

    this.#jsonScanner = new JsonScanner();
    this.#optionValidator = new OptionValidator(this.#optionGroup, this.#storeService, this.#onDiagnostics);
  }

  #parseBoolean(text: string) {
    switch (text) {
      case "true":
        return true;

      case "false":
        return false;
    }

    return;
  }

  #parseString(text: string) {
    if (text.startsWith('"') && text.endsWith('"')) {
      return text.slice(1, -1);
    }

    return;
  }

  #onRequiresValue(
    optionDefinition: OptionDefinition | ItemDefinition,
    optionValue: { origin: DiagnosticOrigin; text: string | undefined },
    isListItem: boolean,
  ) {
    let text: string;

    if (
      optionDefinition.brand === OptionBrand.String &&
      optionValue.text?.startsWith("'") &&
      optionValue.text.endsWith("'")
    ) {
      text = ConfigDiagnosticText.doubleQuotesExpected();
    } else {
      text = isListItem
        ? ConfigDiagnosticText.expectsListItemType(optionDefinition.name, optionDefinition.brand)
        : ConfigDiagnosticText.requiresValueType(optionDefinition.name, optionDefinition.brand, this.#optionGroup);
    }

    this.#onDiagnostics(Diagnostic.error(text, optionValue.origin));
  }

  async #parseValue(optionDefinition: OptionDefinition | ItemDefinition, isListItem = false) {
    let optionValue: { origin: DiagnosticOrigin; text: string | undefined } | undefined;
    let parsedValue: boolean | string | Array<OptionValue> | undefined;

    switch (optionDefinition.brand) {
      case OptionBrand.Boolean: {
        optionValue = this.#jsonScanner.read();

        if (optionValue.text != null) {
          parsedValue = this.#parseBoolean(optionValue.text);
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
          parsedValue = this.#parseString(optionValue.text);
        }

        if (typeof parsedValue !== "string") {
          this.#onRequiresValue(optionDefinition, optionValue, isListItem);
          break;
        }

        if (optionDefinition.name === "rootPath") {
          parsedValue = Path.resolve(Path.dirname(this.#configFilePath), parsedValue);
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
          const diagnostic = Diagnostic.error(`Expected closing ']'.`, rightBracketToken.origin).add({
            // TODO can be Info, since this is not an error
            related: [Diagnostic.error("The opening '[' was seen here.", leftBracketToken.origin)],
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
      this.#onDiagnostics(Diagnostic.error(`Expected '{'.`, leftBraceToken.origin));

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

      const optionNameText = this.#parseString(optionName.text);

      if (!optionNameText) {
        this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.doubleQuotesExpected(), optionName.origin));

        if (this.#jsonScanner.readToken(":")) {
          // TODO might not read list, this should be some fast-forward method
          this.#jsonScanner.read();
        }

        const commaToken = this.#jsonScanner.readToken(",");

        if (!commaToken.value) {
          break;
        }

        continue;
      }

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
      const diagnostic = Diagnostic.error(`Expected closing '}'.`, rightBraceToken.origin).add({
        // TODO can be Info, since this is not an error
        related: [Diagnostic.error("The opening '{' was seen here.", leftBraceToken.origin)],
      });

      this.#onDiagnostics(diagnostic);
    }
  }

  async parse(text: string): Promise<void> {
    this.#jsonScanner.setText(text, this.#configFilePath);

    await this.#parseObject();
  }
}

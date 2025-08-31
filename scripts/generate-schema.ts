import fs from "node:fs/promises";
import * as tstyche from "tstyche/tstyche";

interface JsonSchemaDefinition {
  additionalProperties?: boolean;
  default?: unknown;
  description?: string;
  items?: JsonSchemaDefinition;
  type?: string | Array<string>;
  uniqueItems?: boolean;
}

interface JsonSchema {
  $schema: string;
  properties: Record<string, JsonSchemaDefinition>;
  type: string;
}

const jsonSchema: JsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {},
};

function createJsonSchemaDefinition(
  optionDefinition: tstyche.OptionDefinition | tstyche.ItemDefinition,
  defaultValue?: unknown,
) {
  const jsonSchemaDefinition: JsonSchemaDefinition = {};

  if ("description" in optionDefinition) {
    jsonSchemaDefinition.description = optionDefinition.description;
  }

  if (defaultValue != null) {
    if (optionDefinition.name === "rootPath") {
      defaultValue = "./";
    }
    if (optionDefinition.name === "target") {
      defaultValue = "*";
    }

    jsonSchemaDefinition.default = defaultValue;
  }

  switch (optionDefinition.brand) {
    case tstyche.OptionBrand.Boolean:
      jsonSchemaDefinition.type = "boolean";
      break;

    case tstyche.OptionBrand.List:
      jsonSchemaDefinition.type = "array";
      jsonSchemaDefinition.uniqueItems = true;
      jsonSchemaDefinition.items = createJsonSchemaDefinition(optionDefinition.items);
      break;

    case tstyche.OptionBrand.Number:
      jsonSchemaDefinition.type = "number";
      break;

    case tstyche.OptionBrand.String:
    case tstyche.OptionBrand.SemverRange:
      jsonSchemaDefinition.type = "string";
      break;
  }

  return jsonSchemaDefinition;
}

const configFileOptions = tstyche.Options.for(tstyche.OptionGroup.ConfigFile);

for (const [key, optionDefinition] of configFileOptions) {
  if (key.startsWith("$")) {
    continue;
  }

  jsonSchema.properties[key] = createJsonSchemaDefinition(
    optionDefinition,
    // @ts-expect-error index signature
    tstyche.defaultOptions[key],
  );
}

const schemaFileUrl = new URL("../schema/config.json", import.meta.url);

await fs.writeFile(schemaFileUrl, `${JSON.stringify(jsonSchema, null, 2)}\n`);

console.info(`Schema was written to: '${schemaFileUrl.toString()}'`);

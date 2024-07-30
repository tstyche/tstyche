import fs from "node:fs/promises";
import process from "node:process";
import * as tstyche from "tstyche/tstyche";

/**
 * @typedef {object} JsonSchemaDefinition
 * @property {boolean} [additionalProperties]
 * @property {unknown} [default]
 * @property {string} [description]
 * @property {JsonSchemaDefinition} [items]
 * @property {string} [pattern]
 * @property {string | Array<string>} type
 * @property {boolean} [uniqueItems]
 */

/**
 * @typedef {object} JsonSchema
 * @property {string} $schema
 * @property {Record<string, JsonSchemaDefinition>} properties
 * @property {string} type
 */

/** @type {JsonSchema} */
const jsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {},
  type: "object",
};

/**
 * @param {tstyche.OptionDefinition | tstyche.ItemDefinition} optionDefinition
 * @param {unknown} [defaultValue]
 */
function createJsonSchemaDefinition(optionDefinition, defaultValue) {
  /** @type {JsonSchemaDefinition} */
  const jsonSchemaDefinition = {};

  if (defaultValue != null) {
    jsonSchemaDefinition.default = defaultValue;
  }

  if ("description" in optionDefinition) {
    jsonSchemaDefinition.description = optionDefinition.description;
  }

  if ("pattern" in optionDefinition) {
    jsonSchemaDefinition.pattern = optionDefinition.pattern;
  }

  switch (optionDefinition.brand) {
    case tstyche.OptionBrand.Boolean: {
      jsonSchemaDefinition.type = "boolean";
      break;
    }

    case tstyche.OptionBrand.List: {
      jsonSchemaDefinition.items = createJsonSchemaDefinition(optionDefinition.items);

      jsonSchemaDefinition.type = "array";
      jsonSchemaDefinition.uniqueItems = true;
      break;
    }

    case tstyche.OptionBrand.Number: {
      jsonSchemaDefinition.type = "number";
      break;
    }

    case tstyche.OptionBrand.String: {
      jsonSchemaDefinition.type = "string";
      break;
    }

    default:
      break;
  }

  return jsonSchemaDefinition;
}

const configFileOptionDefinitions = tstyche.OptionDefinitionsMap.for(tstyche.OptionGroup.ConfigFile);

for (const [key, optionDefinition] of configFileOptionDefinitions) {
  jsonSchema.properties[key] = createJsonSchemaDefinition(
    optionDefinition,
    // @ts-expect-error index signature
    tstyche.defaultOptions[key],
  );
}

const schemaFileUrl = new URL("../models/config-schema.json", import.meta.url);

await fs.writeFile(schemaFileUrl, `${JSON.stringify(jsonSchema, null, 2)}\n`);

process.stdout.write(`Schema was written to: '${schemaFileUrl.toString()}'\n`);

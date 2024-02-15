export const enum OptionBrand {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  True = "true", // an option which does not take a value
  List = "list",
}

export const enum OptionGroup {
  CommandLine = 1 << 1,
  ConfigFile = 1 << 2,
}

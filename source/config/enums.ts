export const enum OptionBrand {
  String = "string",
  Number = "number",
  Boolean = "boolean",
  BareTrue = "bareTrue", // a boolean option that does not take a value and when specified is interpreted as 'true'
  List = "list",
}

export const enum OptionGroup {
  CommandLine = 1 << 1,
  ConfigFile = 1 << 2,
}

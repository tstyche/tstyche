export const enum OptionGroup {
  // TODO add PreTask group to filter out options like --help
  CommandLine = 1 << 1,
  ConfigFile = 1 << 2,
}

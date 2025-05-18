export const enum OptionGroup {
  CommandLine = 1 << 1,
  ConfigFile = 1 << 2,
  InlineConfig = 1 << 3,
  ResolvedConfig = CommandLine | ConfigFile,
}

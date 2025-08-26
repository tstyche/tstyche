export const enum ResultStatusFlags {
  Runs = 1 << 0,
  Passed = 1 << 1,
  Failed = 1 << 2,
  Skipped = 1 << 3,
  Fixme = 1 << 4,
  Todo = 1 << 5,
}

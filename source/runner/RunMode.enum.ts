export const enum RunMode {
  Normal = 0,
  Only = 1 << 0,
  Skip = 1 << 1,
  Todo = 1 << 2,
  Void = 1 << 3,
}

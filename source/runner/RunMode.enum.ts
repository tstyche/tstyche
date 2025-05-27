export const enum RunMode {
  Normal = 0,
  Fail = 1 << 0,
  Only = 1 << 1,
  Skip = 1 << 2,
  Todo = 1 << 3,
}

export const enum TestTreeNodeFlags {
  None = 0,
  Only = 1 << 0,
  Skip = 1 << 1,
  Todo = 1 << 2,
}

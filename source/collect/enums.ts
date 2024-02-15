export const enum TestMemberBrand {
  Describe = "describe",
  Test = "test",
  Expect = "expect",
}

export const enum TestMemberFlags {
  None = 0,
  Fail = 1 << 0,
  Only = 1 << 1,
  Skip = 1 << 2,
  Todo = 1 << 3,
}

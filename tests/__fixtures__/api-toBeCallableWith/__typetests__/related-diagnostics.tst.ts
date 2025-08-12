import { expect } from "tstyche";
import { plural as pluralExternal } from "./plural.js";

expect(pluralExternal).type.toBeCallableWith({ count: 10, text: "Sample" });

expect(pluralExternal).type.toBeCallableWith({ count: 100, text: false });

interface PluralOptions {
  count: number;
  text: string;
}

declare function pluralLocal(options: PluralOptions): void;

expect(pluralLocal).type.toBeCallableWith({ count: 10, text: "Sample" });

expect(pluralLocal).type.toBeCallableWith({ count: 100, text: false });
// @ts-expect-error This directive must be visible
pluralLocal();

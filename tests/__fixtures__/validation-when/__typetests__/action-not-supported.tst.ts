import { expect, when } from "tstyche";

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

// @ts-expect-error
when(pipe).isSupportedWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"));

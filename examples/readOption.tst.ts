import { expect } from "tstyche";

declare function readOption<T>(section: string): T | undefined;
declare function readOption<T>(section: string, defaultValue: T): T;

expect(readOption<number>("example")).type.toBe<number | undefined>();
expect(readOption("example")).type.toBe<unknown>();

expect(readOption<number>("example", 30)).type.toBe<number>();
expect(readOption("example", { timeout: 30 })).type.toBe<{ timeout: number }>();

expect(readOption).type.not.toBeInstantiableWith<[]>();

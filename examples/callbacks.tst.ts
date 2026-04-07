import { expect, test } from "tstyche";

declare function fetchData(url: string, callback: (error: Error | null, data: unknown) => void): void;

test("fetchData", () => {
  fetchData("https://api.example.com", (error, data) => {
    expect(error).type.toBe<Error | null>();
    expect(data).type.toBe<unknown>();
  });
});

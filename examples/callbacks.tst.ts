import { expect, test } from "tstyche";

declare function fetchData(url: string, callback: (error: Error | null) => void): void;

test("fetchData", () => {
  fetchData("https://api.example.com", (error) => {
    expect(error).type.toBe<Error | null>();
  });

  fetchData("https://api.example.com", (error) => expect(error).type.toBe<Error | null>());
});

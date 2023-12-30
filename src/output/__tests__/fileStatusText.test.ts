import { URL } from "node:url";
import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { ResultStatus } from "#result";
import { Scribbler } from "#scribbler";
import { fileStatusText } from "../fileStatusText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const sampleTestFile = new URL("../../../path/to/sample.test.ts", import.meta.url);

const scribbler = new Scribbler();

describe("fileStatusText", () => {
  test("formats failing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Failed, sampleTestFile));

    expect(text).toMatchInlineSnapshot(`
      "<red>fail</> <gray>./path/to/</>sample.test.ts
      "
    `);
  });

  test("formats passing file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Passed, sampleTestFile));

    expect(text).toMatchInlineSnapshot(`
      "<green>pass</> <gray>./path/to/</>sample.test.ts
      "
    `);
  });

  test("formats running file status text", () => {
    const text = scribbler.render(fileStatusText(ResultStatus.Runs, sampleTestFile));

    expect(text).toMatchInlineSnapshot(`
      "<yellow>runs</> <gray>./path/to/</>sample.test.ts
      "
    `);
  });
});

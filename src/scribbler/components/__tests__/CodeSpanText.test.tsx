import path from "node:path";
import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import type ts from "typescript/lib/tsserverlibrary.js";
import { Scribbler } from "../../Scribbler.js";
import { CodeSpanText } from "../CodeSpanText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const mockFileText = `import { describe, expect, test } from "tstyche";

declare function takesNone(): void;
declare function takesOne(a: number): void;
declare function takesTwo(a: string, b?: number): void;

describe("function types", () => {
  test("does not take arguments", () => {
    expect(takesNone).type.toEqual<() => void>();
  });

  test("takes one argument", () => {
    expect(takesOne).type.toEqual<(a: number) => number>();
  });

  test("takes two arguments", () => {
    expect(takesTwo).type.toEqual<(a: string, b?: number) => void>();
  });
});
`;

function mockedGetLineAndCharacterOfPosition(position: number) {
  const target = mockFileText.substring(0, position + 1).split("\n");

  const line = target.length - 1;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const character = target[line]!.length ? target[line]!.length - 1 : 0;

  return { character, line };
}

function mockedGetPositionOfLineAndCharacter(line: number, character: number) {
  const lines = mockFileText.split("\n").slice(0, line);

  return [...lines, ""].join(" ").length + character;
}

const mockFile = {
  fileName: path.resolve("path", "to", "sample.test.ts").replaceAll("\\", "/"), // Compiler API always uses posix path separators
  getLineAndCharacterOfPosition(position: number) {
    return mockedGetLineAndCharacterOfPosition(position);
  },
  getPositionOfLineAndCharacter(line: number, character: number) {
    return mockedGetPositionOfLineAndCharacter(line, character);
  },
  text: mockFileText,
} as ts.SourceFile;

const scribbler = new Scribbler();

describe("CodeSpanText", () => {
  test("formats code span text", () => {
    const text = scribbler.render(<CodeSpanText end={392} file={mockFile} start={385} />);

    expect(text).toMatchInlineSnapshot(`
      "  <gray>11 | </>
        <gray>12 |   test("takes one argument", () => {</>
      <red>></> 13 <gray>|</>     expect(takesOne).type.toEqual<(a: number) => number>();
           <gray>|</>                           <red>^</>
        <gray>14 |   });</>
        <gray>15 | </>
        <gray>16 |   test("takes two arguments", () => {</>

             <gray>at</> <cyan>./path/to/sample.test.ts</><gray>:13:27</>
      "
    `);
  });
});

test.todo("handles line at the top of a file");

test.todo("handles line at the bottom of a file");

test.todo("supports indentation tabs");

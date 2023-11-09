import { describe, expect, jest, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const mockedTerminalStream = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  isTTY: true,
  write: jest.fn(),
} as unknown as NodeJS.WriteStream;

const mockedNonTerminalStream = {
  write: jest.fn(),
} as unknown as NodeJS.WriteStream;

const { Logger } = await import("../Logger.js");

describe("Logger", () => {
  describe("'eraseLastLine' method", () => {
    test.each([
      {
        expected: true,
        stdout: mockedTerminalStream,
        testCase: "when the 'stdout' stream is interactive",
      },
      {
        expected: false,
        stdout: mockedNonTerminalStream,
        testCase: "when the 'stdout' stream is not interactive",
      },
    ])("$testCase", ({ stdout }) => {
      const logger = new Logger({ stdout });

      logger.eraseLastLine();

      expect(jest.mocked(mockedTerminalStream.write).mock.calls[0]).toMatchSnapshot();
    });
  });

  describe("'isInteractive' method", () => {
    test.each([
      {
        expected: true,
        stdout: mockedTerminalStream,
        testCase: "when the 'stdout' stream is interactive",
      },
      {
        expected: false,
        stdout: mockedNonTerminalStream,
        testCase: "when the 'stdout' stream is not interactive",
      },
    ])("$testCase", ({ expected, stdout }) => {
      const logger = new Logger({ stdout });

      expect(logger.isInteractive()).toBe(expected);
    });
  });
});

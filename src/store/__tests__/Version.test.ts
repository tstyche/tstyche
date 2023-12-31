import { describe, expect, test } from "@jest/globals";
import { Version } from "../Version.js";

describe("Version", () => {
  describe("'satisfies' method", () => {
    test.each([
      {
        expected: true,
        source: "5.3.2",
        target: "5.3",
        testCase: "when target is provided in 'x.y' form and source minor is equal",
      },
      {
        expected: false,
        source: "5.2.4",
        target: "5.3",
        testCase: "when target is provided in 'x.y' form and source minor is lower",
      },
      {
        expected: true,
        source: "5.4.2",
        target: "5.3",
        testCase: "when target is provided in 'x.y' form and source minor is higher",
      },

      {
        expected: true,
        source: "4.9.5",
        target: "4.9.5",
        testCase: "when target is provided in 'x.y.z' form and all source versions are equal",
      },
      {
        expected: false,
        source: "4.9.4",
        target: "4.9.5",
        testCase: "when target is provided in 'x.y.z' form and source patch is lower",
      },
      {
        expected: true,
        source: "4.9.5",
        target: "4.9.4",
        testCase: "when target is provided in 'x.y.z' form and source patch is higher",
      },
      {
        expected: false,
        source: "5.2.3",
        target: "5.3.2",
        testCase: "when target is provided in 'x.y.z' form and source minor is lower",
      },
      {
        expected: true,
        source: "5.4.2",
        target: "5.3.3",
        testCase: "when target is provided in 'x.y.z' form and source minor is higher",
      },
      {
        expected: false,
        source: "4.6.2",
        target: "5.3.2",
        testCase: "when target is provided in 'x.y.z' form and source major is lower",
      },
      {
        expected: true,
        source: "6.2.2",
        target: "5.3.2",
        testCase: "when target is provided in 'x.y.z' form and source major is higher",
      },

      {
        expected: true,
        source: "5.4.0-dev.20231129",
        target: "5.3",
        testCase: "when target is provided in 'x.y' form and source is a newer 'dev' release",
      },
      {
        expected: false,
        source: "5.3.0-dev.20230822",
        target: "5.4",
        testCase: "when target is provided in 'x.y' form and source is a older 'dev' release",
      },
      {
        expected: true,
        source: "5.4.0-dev.20231129",
        target: "5.4",
        testCase: "when target is provided in 'x.y' form and source is a 'dev' release of the same series",
      },
      {
        expected: false,
        source: "5.4.0-dev.20231129",
        target: "5.4.0-dev.20231207",
        testCase: "when target is provided in 'x.y' form and source older 'dev' release",
      },
      {
        expected: true,
        source: "5.4.0-dev.20231231",
        target: "5.4.0-dev.20231207",
        testCase: "when target is provided in 'x.y' form and source newer 'dev' release",
      },
    ])("$testCase", ({ expected, source, target }) => {
      const result = Version.satisfies(source, target);

      expect(result).toBe(expected);
    });
  });
});

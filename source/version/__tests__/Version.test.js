import assert from "node:assert";
import test from "node:test";
import { Version } from "tstyche/tstyche";

test("Version", async (t) => {
  await t.test("'isGreaterThan' method", async (t) => {
    const testCases = [
      {
        expected: true,
        source: "5.3",
        target: "5.3.2",
        testCase: "when source is provided in 'x.y' form and target minor is equal",
      },
      {
        expected: true,
        source: "5.3",
        target: "5.2.4",
        testCase: "when source is provided in 'x.y' form and target minor is lower",
      },
      {
        expected: false,
        source: "5.3",
        target: "5.4.2",
        testCase: "when source is provided in 'x.y' form and target minor is higher",
      },

      {
        expected: false,
        source: "4.9.5",
        target: "4.9.5",
        testCase: "when source is provided in 'x.y.z' form and all target versions are equal",
      },
      {
        expected: true,
        source: "4.9.5",
        target: "4.9.4",
        testCase: "when source is provided in 'x.y.z' form and target patch is lower",
      },
      {
        expected: false,
        source: "4.9.4",
        target: "4.9.5",
        testCase: "when source is provided in 'x.y.z' form and target patch is higher",
      },
      {
        expected: true,
        source: "5.3.2",
        target: "5.2.3",
        testCase: "when source is provided in 'x.y.z' form and target minor is lower",
      },
      {
        expected: false,
        source: "5.3.3",
        target: "5.4.2",
        testCase: "when source is provided in 'x.y.z' form and target minor is higher",
      },
      {
        expected: true,
        source: "5.3.2",
        target: "4.6.2",
        testCase: "when source is provided in 'x.y.z' form and target major is lower",
      },
      {
        expected: false,
        source: "5.3.2",
        target: "6.2.2",
        testCase: "when source is provided in 'x.y.z' form and target major is higher",
      },

      {
        expected: false,
        source: "5.3",
        target: "5.4.0-dev.20231129",
        testCase: "when source is provided in 'x.y' form and target is a newer 'dev' release",
      },
      {
        expected: true,
        source: "5.4",
        target: "5.3.0-dev.20230822",
        testCase: "when source is provided in 'x.y' form and target is a older 'dev' release",
      },
      {
        expected: true,
        source: "5.4",
        target: "5.4.0-dev.20231129",
        testCase: "when source is provided in 'x.y' form and target is a 'dev' release of the same series",
      },
      {
        expected: false,
        source: "5.4.0-dev.20231129",
        target: "5.4.0-dev.20231129",
        testCase: "when source is provided in 'x.y.z-dev' form and all target versions are equal",
      },
      {
        expected: true,
        source: "5.4.0-dev.20231207",
        target: "5.4.0-dev.20231129",
        testCase: "when source is provided in 'x.y.z-dev' form and target older 'dev' release",
      },
      {
        expected: false,
        source: "5.4.0-dev.20231207",
        target: "5.4.0-dev.20231231",
        testCase: "when source is provided in 'x.y.z-dev' form and target newer 'dev' release",
      },
    ];

    for (const { expected, source, target, testCase } of testCases) {
      await t.test(testCase, () => {
        const result = Version.isGreaterThan(source, target);

        assert.strictEqual(result, expected);
      });
    }
  });

  await t.test("'isSatisfiedWith' method", async (t) => {
    const testCases = [
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
        expected: true,
        source: "5.4.0-dev.20231129",
        target: "5.4.0-dev.20231129",
        testCase: "when target is provided in 'x.y.z-dev' form and all source versions are equal",
      },
      {
        expected: false,
        source: "5.4.0-dev.20231129",
        target: "5.4.0-dev.20231207",
        testCase: "when target is provided in 'x.y.z-dev' form and source older 'dev' release",
      },
      {
        expected: true,
        source: "5.4.0-dev.20231231",
        target: "5.4.0-dev.20231207",
        testCase: "when target is provided in 'x.y.z-dev' form and source newer 'dev' release",
      },
    ];

    for (const { expected, source, target, testCase } of testCases) {
      await t.test(testCase, () => {
        const result = Version.isSatisfiedWith(source, target);

        assert.strictEqual(result, expected);
      });
    }
  });
});

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "..");

const files = [".aube/check-skills.ts", "dist", "package.json", "skills", "schemas", "source", "types"];

test("skill synchronization detects public contract and metadata drift", async (t) => {
  const fixtureParent = await fs.mkdtemp(path.join(os.tmpdir(), "tstyche-skills-"));
  t.after(async () => fs.rm(fixtureParent, { recursive: true, force: true }));

  await t.test("passes for an unchanged fixture", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const result = await runChecker(fixtureRoot);
    assert.equal(result.code, 0, result.output);
  });

  await t.test("fails when a built public contract changes", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const declarationPath = path.join(fixtureRoot, "dist/api.d.ts");
    await fs.appendFile(declarationPath, "\nexport type SkillCheckFixture = true;\n");

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /contract input changed: dist\/api\.d\.ts/);
  });

  await t.test("passes when an implementation-only source comment changes", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const sourcePath = path.join(fixtureRoot, "source/config/Options.ts");
    await fs.appendFile(sourcePath, "\n// implementation-only fixture comment\n");

    const result = await runChecker(fixtureRoot);
    assert.equal(result.code, 0, result.output);
  });

  await t.test("fails when configuration options change", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const schemaPath = path.join(fixtureRoot, "schemas/config.json");
    const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
    schema.properties.fixtureOption = { type: "string" };
    await fs.writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /contract input changed: schemas\/config\.json/);
  });

  await t.test("fails when directive behavior changes", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const directivePath = path.join(fixtureRoot, "source/config/Directive.ts");
    await fs.appendFile(directivePath, "\n// public directive contract fixture\n");

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /review owning skill tstyche-type-tests/);
  });

  await t.test("fails when a skill reference is broken", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const skillPath = path.join(fixtureRoot, "skills/tstyche-type-tests/SKILL.md");
    await fs.appendFile(skillPath, "\nSee [missing](references/does-not-exist.md).\n");

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /referenced resource does not exist/);
  });

  await t.test("fails when a nested skill reference is broken", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const referencePath = path.join(fixtureRoot, "skills/tstyche-type-tests/references/expect-api.md");
    await fs.appendFile(referencePath, "\nSee [missing](references/does-not-exist.md).\n");

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /references\/expect-api\.md: referenced resource does not exist/);
  });

  await t.test("fails when package compatibility metadata changes", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const packagePath = path.join(fixtureRoot, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
    packageJson.engines.node = ">=23";
    await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /contract input changed: package\.json/);
  });

  await t.test("updates package version metadata without changing the skill snapshot", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const packagePath = path.join(fixtureRoot, "package.json");
    const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
    packageJson.version = "7.2.5";
    await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const result = await runChecker(fixtureRoot, ["--write"]);
    assert.equal(result.code, 0, result.output);

    const sources = JSON.parse(await fs.readFile(path.join(fixtureRoot, "skills/sources.json"), "utf8"));
    assert.equal(sources.packageVersion, "7.2.5");

    const secondResult = await runChecker(fixtureRoot);
    assert.equal(secondResult.code, 0, secondResult.output);
  });

  await t.test("reports malformed JSON without throwing", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    await fs.writeFile(path.join(fixtureRoot, "skills/surface.json"), "{\n");

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /skills\/surface\.json: invalid JSON/);
  });

  await t.test("reports malformed manifest entries without throwing", async () => {
    const fixtureRoot = await createFixture(fixtureParent);
    const sourcesPath = path.join(fixtureRoot, "skills/sources.json");
    const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8"));
    sources.coverage[0].resources = [42];
    await fs.writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`);

    const result = await runChecker(fixtureRoot);
    assert.notEqual(result.code, 0);
    assert.match(result.output, /every coverage entry requires url, owner, topics, and resources/);
  });
});

/**
 * @param {string} parent
 */
async function createFixture(parent) {
  const fixtureRoot = await fs.mkdtemp(path.join(parent, "fixture-"));
  for (const file of files) {
    await fs.cp(path.join(repositoryRoot, file), path.join(fixtureRoot, file), { recursive: true });
  }
  return fixtureRoot;
}

/**
 * @param {string} cwd
 * @param {Array<string>} args
 */
async function runChecker(cwd, args = []) {
  try {
    const result = await execFileAsync(process.execPath, [".aube/check-skills.ts", ...args], {
      cwd,
      env: { ...process.env },
    });
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    const execError = /** @type {NodeJS.ErrnoException & {stdout?: string, stderr?: string}} */ (
      /** @type {unknown} */ (error)
    );
    return {
      code: execError.code ?? 1,
      output: `${execError.stdout ?? ""}${execError.stderr ?? ""}`,
    };
  }
}

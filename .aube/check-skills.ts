import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";

interface PackageJson {
  bin?: unknown;
  engines?: unknown;
  exports?: unknown;
  files?: unknown;
  name?: string;
  peerDependencies?: unknown;
  version?: string;
}

interface PackageSurface {
  bin?: unknown;
  engines?: unknown;
  exports?: unknown;
  files?: unknown;
  peerDependencies?: unknown;
}

interface Surface {
  inputs: Record<string, string>;
  package: PackageSurface;
  schemaVersion: number;
}

interface ContractInput {
  kind: "behavior" | "cli-help" | "declaration" | "json" | "package";
  owner: string;
  path: string;
}

interface SourceCoverageEntry {
  owner?: string;
  resources?: Array<string>;
  status?: string;
  topics?: Array<unknown>;
  url?: string;
}

interface SourcesManifest {
  contractInputs?: Array<ContractInput>;
  coverage?: Array<SourceCoverageEntry>;
  package?: string;
  packageVersion?: string;
  upstream?: Record<string, unknown>;
}

const root = resolve(import.meta.dirname, "..");
const skillsRoot = join(root, "skills");
const sourcesPath = join(skillsRoot, "sources.json");
const surfacePath = join(skillsRoot, "surface.json");
const shouldWrite = process.argv.includes("--write");
const contractKinds = new Set<ContractInput["kind"]>(["behavior", "cli-help", "declaration", "json", "package"]);

const errors: Array<string> = [];
const fail = (message: string): void => {
  errors.push(message);
};
const read = (filePath: string): string => readFileSync(filePath, "utf8");

const packageJson = readJson<PackageJson>(join(root, "package.json"), "package.json");
const sources = readJson<SourcesManifest>(sourcesPath, "skills/sources.json");
const skillDirs = getSkillDirs();

if (skillDirs.length === 0) {
  fail("skills/: no skill directories found");
}

for (const dir of skillDirs) {
  validateSkill(dir);
}

if (packageJson != null && sources != null) {
  validateSources(skillDirs, packageJson, sources);
}

const surface = packageJson != null && sources != null ? makeSurface(packageJson, sources) : undefined;

if (surface != null && sources != null && packageJson?.version != null) {
  if (sources.packageVersion !== packageJson.version) {
    if (shouldWrite) {
      sources.packageVersion = packageJson.version;
    } else {
      fail(
        `skills/sources.json: packageVersion must match package.json (${packageJson.version}); run ` +
          "`npm run skills:update` to refresh release metadata",
      );
    }
  }
}

if (shouldWrite && surface != null && sources != null && errors.length === 0) {
  writeJsonAtomically(sourcesPath, sources);
  writeJsonAtomically(surfacePath, surface);
} else if (surface != null && !shouldWrite) {
  validateSurface(surface);
}

if (errors.length > 0) {
  process.stderr.write(`Skill validation failed (${errors.length} error${errors.length === 1 ? "" : "s"}):\n`);
  for (const error of errors) {
    process.stderr.write(`- ${error}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Validated ${skillDirs.length} TSTyche skill${skillDirs.length === 1 ? "" : "s"} and public surface snapshot.\n`,
  );
}

function getSkillDirs(): Array<string> {
  if (!existsSync(skillsRoot)) {
    fail("skills/: directory is missing");
    return [];
  }

  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

function validateSkill(dir: string): void {
  const skillRoot = join(skillsRoot, dir);
  const skillPath = join(skillRoot, "SKILL.md");
  if (!existsSync(skillPath)) {
    fail(`skills/${dir}: SKILL.md is missing`);
  } else {
    const text = read(skillPath);
    validateFrontmatter(dir, text);
  }

  for (const markdownPath of walkFiles(skillRoot, (filePath) => filePath.endsWith(".md"))) {
    validateMarkdownReferences(markdownPath);
  }
}

function validateFrontmatter(dir: string, text: string): void {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    fail(`skills/${dir}/SKILL.md: YAML frontmatter is missing`);
    return;
  }

  const fields: Record<string, string> = Object.fromEntries(
    (match[1] ?? "")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf(":");
        return index === -1
          ? [line.trim(), ""]
          : [
              line.slice(0, index).trim(),
              line
                .slice(index + 1)
                .trim()
                .replace(/^['"]|['"]$/g, ""),
            ];
      }),
  );
  const name = fields["name"] ?? "";
  const description = fields["description"] ?? "";
  if (!/^[a-z0-9](?:[a-z0-9]|-(?!-))*[a-z0-9]$|^[a-z0-9]$/.test(name) || name !== dir || name.length > 64) {
    fail(`skills/${dir}/SKILL.md: name must match the directory and Agent Skills naming rules`);
  }
  if (description.length === 0 || description.length > 1024) {
    fail(`skills/${dir}/SKILL.md: description must be 1-1024 characters`);
  }
  if (text.split(/\r?\n/).length > 500) {
    fail(`skills/${dir}/SKILL.md: keep the entrypoint under 500 lines; move detail to references/`);
  }
}

function validateMarkdownReferences(markdownPath: string): void {
  const text = read(markdownPath);
  const markdownLink = /!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+[^)]*)?\)/g;

  for (const match of text.matchAll(markdownLink)) {
    const rawTarget = match[1]?.replace(/^<|>$/g, "");
    if (rawTarget == null || isExternalReference(rawTarget)) {
      continue;
    }

    const target = rawTarget.split(/[?#]/, 1)[0];
    if (!target) {
      continue;
    }

    const resolvedTarget = resolve(dirname(markdownPath), target);
    const relativeTarget = relative(skillsRoot, resolvedTarget);
    if (relativeTarget.startsWith("..") || relativeTarget.includes("..")) {
      continue;
    }
    if (!existsSync(resolvedTarget)) {
      fail(`${relative(skillsRoot, markdownPath)}: referenced resource does not exist: ${target}`);
    }
  }
}

function isExternalReference(target: string): boolean {
  return target.startsWith("#") || target.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(target);
}

function validateSources(skillDirs: Array<string>, packageData: PackageJson, manifest: SourcesManifest): void {
  if (!Array.isArray(manifest.coverage)) {
    fail("skills/sources.json: coverage must be an array");
  } else {
    const seen = new Set<string>();
    for (const entry of manifest.coverage) {
      if (
        entry == null ||
        typeof entry !== "object" ||
        typeof entry.url !== "string" ||
        typeof entry.owner !== "string" ||
        !Array.isArray(entry.topics) ||
        entry.topics.length === 0 ||
        !Array.isArray(entry.resources) ||
        entry.resources.length === 0 ||
        !entry.resources.every((resource) => typeof resource === "string")
      ) {
        fail("skills/sources.json: every coverage entry requires url, owner, topics, and resources");
        continue;
      }
      if (!skillDirs.includes(entry.owner)) {
        fail(`skills/sources.json: ${entry.url} points to unknown skill ${entry.owner}`);
      }
      for (const resource of entry.resources) {
        const resourcePath = join(skillsRoot, resource);
        if (!existsSync(resourcePath) || !statSync(resourcePath).isFile()) {
          fail(`skills/sources.json: ${entry.url} points to missing resource ${resource}`);
        }
      }
      if (seen.has(entry.url)) {
        fail(`skills/sources.json: duplicate documentation URL ${entry.url}`);
      }
      seen.add(entry.url);
    }
    if (seen.size < 10) {
      fail("skills/sources.json: expected the complete TSTyche documentation surface, not a partial topic list");
    }
  }

  if (!Array.isArray(manifest.contractInputs) || manifest.contractInputs.length === 0) {
    fail("skills/sources.json: contractInputs must be a non-empty array");
  } else {
    const seen = new Set<string>();
    for (const input of manifest.contractInputs) {
      if (
        input == null ||
        typeof input !== "object" ||
        typeof input.path !== "string" ||
        typeof input.owner !== "string" ||
        typeof input.kind !== "string" ||
        !contractKinds.has(input.kind as ContractInput["kind"])
      ) {
        fail("skills/sources.json: every contract input requires path, owner, and kind");
        continue;
      }
      if (!skillDirs.includes(input.owner)) {
        fail(`skills/sources.json: ${input.path} points to unknown skill ${input.owner}`);
      }
      if (seen.has(input.path)) {
        fail(`skills/sources.json: duplicate contract input ${input.path}`);
      }
      seen.add(input.path);
    }
    for (const skill of skillDirs) {
      if (!manifest.contractInputs.some((input) => input.owner === skill)) {
        fail(`skills/sources.json: skill ${skill} owns no contract inputs`);
      }
    }
  }

  if (manifest.package !== packageData.name) {
    fail(`skills/sources.json: package must be ${packageData.name}`);
  }
  if (typeof packageData.version !== "string" || packageData.version.length === 0) {
    fail("package.json: version must be a non-empty string for skills synchronization");
  }
}

function makeSurface(packageData: PackageJson, manifest: SourcesManifest): Surface {
  const packageSurface: PackageSurface = {
    exports: packageData.exports,
    engines: packageData.engines,
    peerDependencies: packageData.peerDependencies,
    bin: packageData.bin,
    files: packageData.files,
  };
  const inputs: Record<string, string> = {};

  for (const input of manifest.contractInputs ?? []) {
    if (
      input == null ||
      typeof input.path !== "string" ||
      typeof input.owner !== "string" ||
      typeof input.kind !== "string" ||
      !contractKinds.has(input.kind as ContractInput["kind"])
    ) {
      continue;
    }
    const filePath = join(root, input.path);
    if (!existsSync(filePath)) {
      fail(`surface input is missing: ${input.path}; run the build before checking Agent Skills`);
      continue;
    }

    let contents: string;
    try {
      contents = extractContractInput(input, filePath);
    } catch (error) {
      fail(`surface input failed: ${input.path} (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }
    inputs[input.path] = createHash("sha256").update(contents).digest("hex");
  }

  return { schemaVersion: 2, package: packageSurface, inputs };
}

function extractContractInput(input: ContractInput, filePath: string): string {
  if (input.kind === "package") {
    const packageData = JSON.parse(read(filePath)) as PackageJson;
    return JSON.stringify({
      bin: packageData.bin,
      engines: packageData.engines,
      exports: packageData.exports,
      files: packageData.files,
      peerDependencies: packageData.peerDependencies,
    });
  }

  if (input.kind === "json") {
    return JSON.stringify(JSON.parse(read(filePath)));
  }

  if (input.kind === "cli-help") {
    const environment = { ...process.env };
    environment["TSTYCHE_NO_COLOR"] = "1";
    environment["TSTYCHE_NO_INTERACTIVE"] = "1";

    return execFileSync(process.execPath, [filePath, "--help"], {
      cwd: root,
      encoding: "utf8",
      env: environment,
    });
  }

  return normalize(read(filePath));
}

function validateSurface(surface: Surface): void {
  if (!existsSync(surfacePath)) {
    fail("skills/surface.json is missing; run `npm run skills:update` after reviewing the skill content");
    return;
  }

  const committed = readJson<Surface>(surfacePath, "skills/surface.json");
  if (committed == null) {
    return;
  }

  if (JSON.stringify(committed) !== JSON.stringify(surface)) {
    const changedInputs = Object.keys(surface.inputs).filter(
      (input) => committed.inputs?.[input] !== surface.inputs[input],
    );
    const removedInputs = Object.keys(committed.inputs ?? {}).filter((input) => !(input in surface.inputs));
    for (const input of [...changedInputs, ...removedInputs]) {
      const owner = getInputOwner(input);
      fail(
        `contract input changed: ${input}; review owning skill ${owner}, then run ` +
          "`npm run skills:update` after updating the guidance",
      );
    }
    if (changedInputs.length === 0 && removedInputs.length === 0) {
      fail("skills/surface.json metadata is stale; run `npm run skills:update` after reviewing skill guidance");
    }
  }
}

function getInputOwner(inputPath: string): string {
  for (const input of sources?.contractInputs ?? []) {
    if (input.path === inputPath) {
      return input.owner;
    }
  }
  return "(unassigned)";
}

function readJson<T>(filePath: string, label: string): T | undefined {
  if (!existsSync(filePath)) {
    fail(`${label}: file is missing`);
    return;
  }

  try {
    return JSON.parse(read(filePath)) as T;
  } catch (error) {
    fail(`${label}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return;
  }
}

function writeJsonAtomically(filePath: string, value: unknown): void {
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, filePath);
}

function walkFiles(directory: string, predicate: (filePath: string) => boolean): Array<string> {
  if (!existsSync(directory)) {
    return [];
  }

  const files: Array<string> = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(filePath, predicate));
    } else if (predicate(filePath)) {
      files.push(filePath);
    }
  }
  return files;
}

function normalize(text: string): string {
  return `${text.replaceAll("\r\n", "\n").replace(/\s+$/gm, "").trim()}\n`;
}

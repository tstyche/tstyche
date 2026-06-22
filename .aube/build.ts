import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { $ } from "zx";
import packageConfig from "../package.json" with { type: "json" };

// prebuild

await fs.rm("./dist", { force: true, recursive: true });

await fs.copyFile("./source/index.ts", "./source/index.cts");
await fs.copyFile("./types/index.ts", "./types/index.cts");

// build

const sourceMap = process.argv.includes("--sourcemap");

await $`tsc --project ./source/tsconfig.json --checkJs false --noEmit false --removeComments true --sourceMap ${sourceMap}`;
await $`tsc --project ./source/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap ${sourceMap}`;
await $`tsc --project ./types/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap ${sourceMap}`;

// postbuild

// TODO handle sourcemaps

await fs.rm("./source/index.cts");
await fs.rm("./types/index.cts");

const files = fs.glob("dist/**/*", { withFileTypes: true });

for await (const file of files) {
  if (!file.isFile()) {
    continue;
  }

  const filePath = path.join(file.parentPath, file.name);

  const text = await fs.readFile(filePath, { encoding: "utf-8" });

  let newText: string | undefined;

  if (filePath.endsWith(".js")) {
    newText = text.replaceAll("__version__", packageConfig.version);
  }

  if (filePath.endsWith(".d.ts")) {
    newText = text.replaceAll(/\bconst enum\b/g, "enum");
  }

  if (newText != null && text !== newText) {
    await fs.writeFile(filePath, newText, { encoding: "utf-8" });
  }

  if (filePath.endsWith("bin.js")) {
    await fs.chmod(filePath, 0o755);
  }

  if (filePath.endsWith("bin.d.ts")) {
    await fs.rm(filePath);
  }
}

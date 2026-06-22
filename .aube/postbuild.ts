import fs from "node:fs/promises";
import path from "node:path";
import packageConfig from "../package.json" with { type: "json" };

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

  if (filePath.endsWith("bin.js")) {
    await fs.chmod(filePath, 0o755);
  }

  if (filePath.endsWith(".d.ts")) {
    newText = text.replaceAll(/\bconst enum\b/g, "enum");
  }

  if (newText != null && text !== newText) {
    await fs.writeFile(filePath, newText, { encoding: "utf-8" });
  }
}

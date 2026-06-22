import fs from "node:fs/promises";

await fs.rm("./dist", { force: true, recursive: true });

await fs.copyFile("./source/index.ts", "./source/index.cts");
await fs.copyFile("./types/index.ts", "./types/index.cts");

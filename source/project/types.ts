import type { CompatProjectService } from "./CompatProjectService.js";
import type { NativeProjectService } from "./NativeProjectService.js";

export interface FileSystem {
  fileExists?: (path: string) => boolean | undefined;
  readFile?: (path: string) => string | undefined;
}

export type ProjectService = CompatProjectService | NativeProjectService;

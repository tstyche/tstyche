import type { CompatProjectService } from "./CompatProjectService.js";
import type { NativeProjectService } from "./NativeProjectService.js";

export type ProjectService = CompatProjectService | NativeProjectService;

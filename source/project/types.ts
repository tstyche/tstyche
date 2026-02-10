import type { ProjectConfigKind } from "./ProjectConfigKind.enum.js";

export type ProjectConfig = { kind: ProjectConfigKind; specifier: string };

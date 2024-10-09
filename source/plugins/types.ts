import type { ResolvedConfig } from "#config";

export type Hooks = {
  config: ResolvedConfig;
  select: Array<string | URL>;
  // TODO also add 'runner', 'target', 'project', etc
};

export type Plugin = {
  [K in keyof Hooks]?: (
    options: Hooks[K],
  ) => Hooks[K] extends Array<unknown> ? Hooks[K] | Promise<Hooks[K]> : Partial<Hooks[K]> | Promise<Partial<Hooks[K]>>;
};

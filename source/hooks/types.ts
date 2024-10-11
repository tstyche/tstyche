import type { ResolvedConfig } from "#config";

export type CustomizationHooks = {
  config: ResolvedConfig;
  select: Array<string | URL>;
  // TODO also add 'runner', 'target', 'project', etc
};

export type Hooks = {
  [K in keyof CustomizationHooks]?: (
    options: CustomizationHooks[K],
  ) => CustomizationHooks[K] extends Array<unknown>
    ? CustomizationHooks[K] | Promise<CustomizationHooks[K]>
    : Partial<CustomizationHooks[K]> | Promise<Partial<CustomizationHooks[K]>>;
};

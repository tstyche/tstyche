import type { Hooks, Plugin } from "./types.js";

export class PluginService {
  static #plugins = new Map<string, Plugin>();

  static async callHook<T extends keyof Hooks>(hook: T, options: Hooks[T]): Promise<Hooks[T]> {
    for (const plugin of PluginService.#plugins.values()) {
      const result = await plugin[hook]?.(options);

      Object.assign(options, result);
    }

    return options;
  }

  static async register(plugins: Array<string>) {
    for (const plugin of plugins) {
      if (!PluginService.#plugins.has(plugin)) {
        PluginService.#plugins.set(plugin, (await import(plugin)).default);
      }
    }
  }
}

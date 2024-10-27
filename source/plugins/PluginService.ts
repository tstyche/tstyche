import type { Hooks, Plugin } from "./types.js";

export class PluginService {
  static #handlers = new Map<string, Hooks>();

  static addHandler(plugin: Plugin): void {
    PluginService.#handlers.set(plugin.name, plugin);
  }

  static async call<T extends keyof Hooks>(
    hook: T,
    argument: Parameters<Required<Hooks>[T]>[0],
    context: ThisParameterType<Required<Hooks>[T]>,
  ): Promise<Awaited<ReturnType<Required<Hooks>[T]>>> {
    let result = argument as Awaited<ReturnType<Required<Hooks>[T]>>;

    for (const [, plugin] of PluginService.#handlers) {
      if (hook in plugin) {
        result = await (plugin[hook] as Function).call(context, result);
      }
    }

    return result;
  }

  static removeHandlers(): void {
    PluginService.#handlers.clear();
  }
}

import type { Plugin } from "./types.js";

type Hooks = Required<Omit<Plugin, "name">>;

export class PluginService {
  static #handlers = new Map<string, Plugin>();

  static addHandler(plugin: Plugin): void {
    PluginService.#handlers.set(plugin.name, plugin);
  }

  static async call<T extends keyof Hooks>(
    hook: T,
    argument: Parameters<Hooks[T]>[0],
    context: ThisParameterType<Hooks[T]>,
  ): Promise<Awaited<ReturnType<Hooks[T]>>> {
    let result = argument as Awaited<ReturnType<Hooks[T]>>;

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

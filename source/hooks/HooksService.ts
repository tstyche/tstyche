import type { CustomizationHooks, Hooks } from "./types.js";

export class HooksService {
  static #handlers = new Set<Hooks>();

  static addHandler(hooks: Hooks): void {
    HooksService.#handlers.add(hooks);
  }

  static async call<T extends keyof CustomizationHooks>(
    hook: T,
    options: CustomizationHooks[T],
  ): Promise<CustomizationHooks[T]> {
    for (const plugin of HooksService.#handlers.values()) {
      const result = await plugin[hook]?.(options);

      if (Array.isArray(result)) {
        options = result as CustomizationHooks[T];
      } else {
        Object.assign(options, result);
      }
    }

    return options;
  }

  static removeHandlers(): void {
    HooksService.#handlers.clear();
  }
}

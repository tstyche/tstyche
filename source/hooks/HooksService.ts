import type { ResolvedConfig } from "#config";
import type { Hooks } from "./types.js";

export class HooksService {
  static #handlers = new Set<Hooks>();

  static addHandler(hooks: Hooks): void {
    HooksService.#handlers.add(hooks);
  }

  static async call(hook: "config", resolvedConfig: ResolvedConfig): Promise<ResolvedConfig>;
  static async call(hook: "select", testFiles: Array<string>): Promise<Array<string | URL>>;
  static async call(
    hook: keyof Hooks,
    options: ResolvedConfig | Array<string | URL>,
  ): Promise<ResolvedConfig | Array<string | URL>> {
    for (const handler of HooksService.#handlers) {
      const result = await handler[hook]?.(options as ResolvedConfig & Array<string>);

      if (result != null) {
        options = result;
      }
    }

    return options;
  }

  static removeHandlers(): void {
    HooksService.#handlers.clear();
  }
}

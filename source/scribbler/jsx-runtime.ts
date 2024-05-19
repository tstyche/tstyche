import type { ComponentConstructor, ScribblerJsx } from "./types.js";

export type { ScribblerJsx as JSX };

export function jsx(type: ComponentConstructor | string, props: Record<string, unknown>): ScribblerJsx.Element {
  return { props, type };
}

export { jsx as jsxs };

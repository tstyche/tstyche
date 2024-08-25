import type { FunctionComponent, ScribblerJsx } from "./types.js";

export type { ScribblerJsx as JSX };

export function jsx(type: FunctionComponent | string, props: Record<string, unknown>): ScribblerJsx.Element {
  return { props, type };
}

export { jsx as jsxs };

import type react from "react";

declare module "react" {
  export namespace JSX {
    interface IntrinsicElements {
      "tst:describe": { name: string; children: react.ReactElement | Array<react.ReactElement> };
      "tst:test": { name: string; children: react.ReactElement | Array<react.ReactElement> };
      "tst:it": { name: string; children: react.ReactElement | Array<react.ReactElement> };
      "tst:expect": { component: unknown; children: react.ReactNode };
      "tst:not": { children: react.ReactElement };
      "tst:toAcceptProps": { [key: PropertyKey]: unknown; children?: never };
      "tst:toAcceptChildren": { children?: unknown | undefined };
    }
  }
}

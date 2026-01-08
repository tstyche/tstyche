import { expect } from "tstyche";

type AsyncProps<T> = {
  [K in keyof T]+?: T[K] | Promise<T[K]>;
};

type WithLoading<T> = T & { loading: boolean };

expect<WithLoading<AsyncProps<{ query: string }>>>().type.toBe<{
  query?: string | Promise<string>;
  loading: boolean;
}>();

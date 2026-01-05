import { expect } from "tstyche";

type AsyncProps<T> = {
  [K in keyof T]+?: Promise<T[K]> | T[K];
};

type WithLoading<T> = T & { loading: boolean };

expect<WithLoading<AsyncProps<{ id: string }>>>().type.toBe<{
  id?: Promise<string> | string;
  loading: boolean;
}>();

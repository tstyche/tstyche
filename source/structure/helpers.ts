export function ensureArray<T>(input: ReadonlyArray<T> | undefined): ReadonlyArray<T> {
  return input ?? [];
}

export function length(array: ReadonlyArray<unknown> | undefined): number {
  return array?.length ?? 0;
}

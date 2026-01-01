import type ts from "typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";

export class SeenService {
  #cache = new Map<string, ComparisonResult>();

  memoized(a: ts.Type, b: ts.Type, compare: () => boolean): boolean {
    const key = [a.id, b.id].sort().join(":");
    const result = this.#cache.get(key);

    if (result !== undefined) {
      return result !== ComparisonResult.Different;
    }

    this.#cache.set(key, ComparisonResult.Pending);

    const isSame = compare();

    this.#cache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

    return isSame;
  }
}

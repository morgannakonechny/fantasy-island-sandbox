// Yahoo's Fantasy API returns JSON that mirrors its old XML shape: arrays of
// single-key objects, and array-like containers keyed by stringified indices
// plus a "count" field. These helpers flatten that into normal objects.
/* eslint-disable @typescript-eslint/no-explicit-any -- shape is dictated by Yahoo's untyped API response */

export function mergeMeta(arr: unknown): Record<string, any> {
  const out: Record<string, any> = {};
  if (!Array.isArray(arr)) return out;
  for (const item of arr) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      Object.assign(out, item);
    }
  }
  return out;
}

// Sub-resources (stats, standings, scoreboard, ...) add extra entries to an
// item's array whose position isn't guaranteed, so scan for a key by name
// instead of assuming a fixed index.
export function findByKey(entryArray: unknown, key: string): any {
  if (!Array.isArray(entryArray)) return undefined;
  for (const item of entryArray) {
    if (item && typeof item === "object" && !Array.isArray(item) && key in item) {
      return (item as Record<string, any>)[key];
    }
  }
  return undefined;
}

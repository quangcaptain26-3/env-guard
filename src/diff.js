/**
 * @file Key-set comparison.
 *
 * Functional Core: pure set arithmetic over arrays of variable names. No I/O,
 * no console access, no knowledge of files or of the process.
 *
 * @module src/diff
 */

/**
 * Compare the keys required by `.env.example` with the keys present in `.env`.
 *
 * - `missing`: declared in `exampleKeys` but absent from `envKeys` (blocking).
 * - `extra`: present in `envKeys` but undocumented in `exampleKeys` (warning).
 * - `isSynced`: `true` when and only when nothing is missing. Extra keys are a
 *   warning only and therefore never break synchronization.
 *
 * Input order is preserved and duplicates are collapsed. Non-array inputs are
 * treated as empty lists so the function is total.
 *
 * @param {readonly string[]} exampleKeys Keys required by the template file.
 * @param {readonly string[]} envKeys Keys found in the local environment file.
 * @returns {{ missing: string[], extra: string[], isSynced: boolean }}
 *   Comparison result.
 */
export function diffEnvKeys(exampleKeys, envKeys) {
  const expected = Array.isArray(exampleKeys) ? exampleKeys : [];
  const actual = Array.isArray(envKeys) ? envKeys : [];

  /** @type {Set<string>} */
  const expectedSet = new Set(expected);
  /** @type {Set<string>} */
  const actualSet = new Set(actual);

  /** @type {string[]} */
  const missing = [];
  /** @type {Set<string>} */
  const seenMissing = new Set();
  for (const key of expected) {
    if (actualSet.has(key) || seenMissing.has(key)) {
      continue;
    }
    seenMissing.add(key);
    missing.push(key);
  }

  /** @type {string[]} */
  const extra = [];
  /** @type {Set<string>} */
  const seenExtra = new Set();
  for (const key of actual) {
    if (expectedSet.has(key) || seenExtra.has(key)) {
      continue;
    }
    seenExtra.add(key);
    extra.push(key);
  }

  return {
    missing,
    extra,
    isSynced: missing.length === 0,
  };
}

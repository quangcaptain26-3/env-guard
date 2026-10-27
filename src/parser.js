/**
 * @file Dotenv key extraction.
 *
 * Functional Core: this module is pure. It performs no file-system access, no
 * console output and never inspects environment values. It only turns raw
 * dotenv text into an ordered list of unique keys.
 *
 * @module src/parser
 */

/** @type {string} Byte-order mark that may prefix a UTF-8 file. */
const BOM = '\uFEFF';

/** @type {RegExp} Optional shell-style `export ` prefix (one or more spaces/tabs). */
const EXPORT_PREFIX = /^export\s+/;

/** @type {RegExp} A valid dotenv key: word characters, dots and dashes only. */
const KEY_PATTERN = /^[\w.-]+$/;

/**
 * Extract the variable names declared in a dotenv document.
 *
 * Rules (per AC-3):
 * - Blank lines and `#` comments are ignored (including commented-out keys).
 * - A leading `export ` prefix is stripped (`export API_KEY=1` -> `API_KEY`).
 * - The key is everything before the **first** `=` (`TOKEN=a=b` -> `TOKEN`).
 * - Surrounding whitespace is trimmed; lines without `=` are ignored.
 * - Duplicate keys are removed, keeping first-seen order.
 *
 * Only keys are read: values are never returned or stored.
 *
 * @param {string} content Raw file content (UTF-8).
 * @returns {string[]} Unique variable names in order of appearance.
 */
export function parseEnvKeys(content) {
  if (typeof content !== 'string' || content.length === 0) {
    return [];
  }

  const source = content.startsWith(BOM) ? content.slice(1) : content;
  /** @type {string[]} */
  const keys = [];
  /** @type {Set<string>} */
  const seen = new Set();

  for (const rawLine of source.split(/\r\n|\r|\n/)) {
    let line = rawLine.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    line = line.replace(EXPORT_PREFIX, '');

    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    if (!KEY_PATTERN.test(key) || seen.has(key)) {
      continue;
    }

    seen.add(key);
    keys.push(key);
  }

  return keys;
}

/**
 * @file Terminal report formatting.
 *
 * Functional Core: turns a `DiffResult` into a printable string. No `fs`, no
 * `console`, no `process.exit`. The only environment probe is the standard
 * `NO_COLOR` convention, and it can always be overridden by the caller through
 * `options.noColor`, which keeps the function deterministic under test.
 *
 * Security: only variable **names** are rendered. Values never reach this
 * module, so they can never be printed.
 *
 * @module src/format
 */

/** @type {Readonly<{ red: string, green: string, yellow: string, reset: string }>} */
const ANSI = Object.freeze({
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
});

/** @type {Readonly<{ success: string, missing: string, extra: string }>} */
const ICON = Object.freeze({
  success: '✔',
  missing: '✖',
  extra: '!',
});

/** @type {string} Indentation applied to every reported key. */
const ITEM_INDENT = '  - ';

/**
 * Decide whether ANSI colors must be suppressed.
 *
 * Precedence: explicit `options.noColor` boolean > `NO_COLOR` environment
 * variable (see https://no-color.org: set and non-empty disables color).
 *
 * @param {{ noColor?: boolean }} [options] Formatting options.
 * @returns {boolean} `true` when output must be plain text.
 */
function shouldDisableColor(options) {
  if (typeof options.noColor === 'boolean') {
    return options.noColor;
  }
  const { NO_COLOR } = process.env;
  return NO_COLOR !== undefined && NO_COLOR !== '';
}

/**
 * Wrap `text` in an ANSI color when colors are enabled.
 *
 * @param {string} text Text to paint.
 * @param {string} color ANSI opening sequence.
 * @param {boolean} enabled Whether coloring is active.
 * @returns {string} Painted or plain text.
 */
function paint(text, color, enabled) {
  return enabled ? `${color}${text}${ANSI.reset}` : text;
}

/**
 * Render a human-readable parity report.
 *
 * Layout:
 * - Success (nothing missing, nothing extra): green
 *   `✔ All environment variables are synchronized!`
 * - Success with undocumented keys: green
 *   `✔ All required environment variables are present.` plus the yellow block.
 * - Missing keys: red `✖ Missing environment variables (n):` block.
 * - Extra keys: yellow `! Extra environment variables (n):` block.
 *
 * The returned string has no trailing newline; the shell decides how to print.
 *
 * @param {{ missing?: string[], extra?: string[], isSynced?: boolean }} diffResult
 *   Result produced by {@link module:src/diff.diffEnvKeys}.
 * @param {{ noColor?: boolean }} [options] Formatting options.
 * @returns {string} Report body, possibly containing ANSI escapes.
 */
export function formatReport(diffResult, options = {}) {
  const result = diffResult ?? {};
  const opts = options ?? {};
  const missing = Array.isArray(result.missing) ? result.missing : [];
  const extra = Array.isArray(result.extra) ? result.extra : [];

  const color = !shouldDisableColor(opts);
  /** @type {string[]} */
  const lines = [];

  if (missing.length > 0) {
    lines.push(
      paint(
        `${ICON.missing} Missing environment variables (${missing.length}):`,
        ANSI.red,
        color,
      ),
    );
    for (const key of missing) {
      lines.push(paint(`${ITEM_INDENT}${key}`, ANSI.red, color));
    }
  } else if (extra.length === 0) {
    lines.push(
      paint(
        `${ICON.success} All environment variables are synchronized!`,
        ANSI.green,
        color,
      ),
    );
  } else {
    lines.push(
      paint(
        `${ICON.success} All required environment variables are present.`,
        ANSI.green,
        color,
      ),
    );
  }

  if (extra.length > 0) {
    lines.push(
      paint(
        `${ICON.extra} Extra environment variables (${extra.length}):`,
        ANSI.yellow,
        color,
      ),
    );
    for (const key of extra) {
      lines.push(paint(`${ITEM_INDENT}${key}`, ANSI.yellow, color));
    }
  }

  return lines.join('\n');
}

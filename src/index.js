/**
 * @file Programmatic API for env-gap.
 *
 * Re-exports the Functional Core and adds a small convenience helper so other
 * JavaScript/TypeScript projects can embed the parity check without spawning a
 * child process. Everything here stays pure: callers own all file I/O.
 *
 * @module env-gap
 */

import { diffEnvKeys } from './diff.js';
import { formatReport } from './format.js';
import { parseEnvKeys } from './parser.js';

export { parseEnvKeys, diffEnvKeys, formatReport };

/**
 * Parse two dotenv documents, compare their keys and render the report.
 *
 * Both inputs are raw file contents, not paths: this keeps the helper free of
 * `node:fs` and usable from any runtime that can read files itself.
 *
 * @param {string} exampleContent Raw content of `.env.example`.
 * @param {string} envContent Raw content of `.env`.
 * @param {{ noColor?: boolean }} [options] Formatting options forwarded to
 *   {@link formatReport}.
 * @returns {{ missing: string[], extra: string[], isSynced: boolean, report: string }}
 *   Diff result plus the rendered, printable report.
 *
 * @example
 * import { checkEnvParity } from 'env-gap';
 * const { isSynced, missing, report } = checkEnvParity(exampleText, envText);
 */
export function checkEnvParity(exampleContent, envContent, options = {}) {
  const exampleKeys = parseEnvKeys(exampleContent);
  const envKeys = parseEnvKeys(envContent);
  const diff = diffEnvKeys(exampleKeys, envKeys);

  return {
    missing: diff.missing,
    extra: diff.extra,
    isSynced: diff.isSynced,
    report: formatReport(diff, options),
  };
}

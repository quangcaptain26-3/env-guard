#!/usr/bin/env node
/**
 * @file CLI entry point (Imperative Shell).
 *
 * This is the only place allowed to touch the file system, the terminal and the
 * exit code. All decisions are delegated to the Functional Core in `src/`.
 *
 * Security: files are parsed into **key names only**; values are never logged,
 * stored globally or included in any message.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { diffEnvKeys } from '../src/diff.js';
import { formatReport } from '../src/format.js';
import { parseEnvKeys } from '../src/parser.js';

/** @type {string} */
const EXAMPLE_FILE = '.env.example';
/** @type {string} */
const ENV_FILE = '.env';
/** @type {string} */
const ANSI_YELLOW = '\x1b[33m';
/** @type {string} */
const ANSI_RESET = '\x1b[0m';

/**
 * Decide whether ANSI output should be suppressed.
 *
 * Colors are disabled when stdout is redirected (not a TTY) or when the
 * `NO_COLOR` convention is active (present and non-empty).
 *
 * @returns {boolean} `true` when plain text is required.
 */
function shouldUsePlainText() {
  if (!process.stdout.isTTY) {
    return true;
  }
  const { NO_COLOR } = process.env;
  return NO_COLOR !== undefined && NO_COLOR !== '';
}

/**
 * Print a short, actionable warning to stderr.
 *
 * @param {string} message Message body (file names only, never values).
 * @param {boolean} plain When `true`, skip ANSI escapes.
 * @returns {void}
 */
function warn(message, plain) {
  console.error(plain ? message : `${ANSI_YELLOW}${message}${ANSI_RESET}`);
}

/**
 * Read a dotenv file, translating the common failures into user guidance.
 *
 * @param {string} filePath Absolute path to read.
 * @param {string} fileName File name used in messages.
 * @param {string} hint Extra guidance printed when the file is absent.
 * @param {boolean} plain When `true`, skip ANSI escapes.
 * @returns {{ ok: true, content: string } | { ok: false, code: number }}
 *   Read result or a ready-to-use exit code.
 */
function readDotenvFile(filePath, fileName, hint, plain) {
  try {
    return { ok: true, content: readFileSync(filePath, 'utf8') };
  } catch (error) {
    const code = /** @type {NodeJS.ErrnoException} */ (error).code;

    if (code === 'ENOENT') {
      warn(`! Cannot find ${fileName} in ${process.cwd()}`, plain);
      warn(`  ${hint}`, plain);
      return { ok: false, code: 1 };
    }

    if (code === 'EACCES' || code === 'EPERM') {
      warn(`! Permission denied while reading ${fileName}.`, plain);
      return { ok: false, code: 1 };
    }

    const reason = error instanceof Error ? error.message : String(error);
    warn(`! Unable to read ${filePath}: ${reason}`, plain);
    return { ok: false, code: 1 };
  }
}

/**
 * Run the parity check against the current working directory.
 *
 * @returns {number} `0` when nothing is missing, otherwise `1`.
 */
function main() {
  const plain = shouldUsePlainText();
  const cwd = process.cwd();

  const example = readDotenvFile(
    path.resolve(cwd, EXAMPLE_FILE),
    EXAMPLE_FILE,
    `Create ${EXAMPLE_FILE} with the variables your project requires, then run env-guard again.`,
    plain,
  );
  if (!example.ok) {
    return example.code;
  }

  const env = readDotenvFile(
    path.resolve(cwd, ENV_FILE),
    ENV_FILE,
    `Copy ${EXAMPLE_FILE} to ${ENV_FILE} and fill in your local values.`,
    plain,
  );
  if (!env.ok) {
    return env.code;
  }

  const result = diffEnvKeys(parseEnvKeys(example.content), parseEnvKeys(env.content));
  console.log(formatReport(result, { noColor: plain }));

  return result.isSynced ? 0 : 1;
}

process.exitCode = main();

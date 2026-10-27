/**
 * @file Integration tests for the CLI shell and the programmatic API.
 *
 * The CLI is executed as a real child process (`node bin/cli.js`) inside a
 * throwaway directory, so exit codes and stream contents are asserted end to
 * end. Only Node.js built-ins are used.
 */

import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  checkEnvParity,
  diffEnvKeys,
  formatReport,
  parseEnvKeys,
} from '../src/index.js';

const execFileAsync = promisify(execFile);
const CLI_PATH = fileURLToPath(new URL('../bin/cli.js', import.meta.url));

/**
 * Create a temporary project directory with dotenv files.
 *
 * @param {import('node:test').TestContext} t Test context used for cleanup.
 * @param {Record<string, string>} files File name -> content map.
 * @returns {string} Absolute path to the temporary directory.
 */
function createProject(t, files) {
  const dir = mkdtempSync(path.join(tmpdir(), 'env-gap-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), content, 'utf8');
  }

  return dir;
}

/**
 * Execute the CLI in `cwd` with colors disabled for deterministic assertions.
 *
 * @param {string} cwd Working directory for the child process.
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 *   Exit code and captured streams.
 */
async function runCli(cwd) {
  const env = { ...process.env, NO_COLOR: '1' };

  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [CLI_PATH], {
      cwd,
      encoding: 'utf8',
      env,
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return {
      code: /** @type {number} */ (error.code),
      stdout: /** @type {string} */ (error.stdout ?? ''),
      stderr: /** @type {string} */ (error.stderr ?? ''),
    };
  }
}

describe('cli - exit codes', () => {
  it('exits 0 when .env contains every key from .env.example', async (t) => {
    const cwd = createProject(t, {
      '.env.example': 'PORT=3000\nDB_URL=postgres://example/app\n',
      '.env': 'PORT=8080\nDB_URL=postgres://localhost/dev\n',
    });

    const result = await runCli(cwd);

    assert.equal(result.code, 0);
    assert.match(result.stdout, /All environment variables are synchronized!/);
  });

  it('exits 1 and lists only the missing key names', async (t) => {
    const cwd = createProject(t, {
      '.env.example': 'PORT=3000\nSTRIPE_KEY=sk_test_do_not_print\n',
      '.env': 'PORT=8080\n',
    });

    const result = await runCli(cwd);

    assert.equal(result.code, 1);
    assert.match(result.stdout, /Missing environment variables \(1\)/);
    assert.match(result.stdout, /STRIPE_KEY/);
    assert.ok(!result.stdout.includes('sk_test_do_not_print'));
  });

  it('exits 0 and warns when .env has extra keys', async (t) => {
    const cwd = createProject(t, {
      '.env.example': 'PORT=3000\n',
      '.env': 'PORT=8080\nLEGACY_TOKEN=legacy-value\n',
    });

    const result = await runCli(cwd);

    assert.equal(result.code, 0);
    assert.match(result.stdout, /All required environment variables are present/);
    assert.match(result.stdout, /Extra environment variables \(1\)/);
    assert.match(result.stdout, /LEGACY_TOKEN/);
    assert.ok(!result.stdout.includes('legacy-value'));
  });

  it('exits 1 when .env.example is missing', async (t) => {
    const cwd = createProject(t, { '.env': 'PORT=8080\n' });

    const result = await runCli(cwd);

    assert.equal(result.code, 1);
    assert.match(result.stderr, /Cannot find \.env\.example/);
    assert.doesNotMatch(result.stderr, /at .*\.js:\d+/);
  });

  it('exits 1 when .env is missing', async (t) => {
    const cwd = createProject(t, { '.env.example': 'PORT=3000\n' });

    const result = await runCli(cwd);

    assert.equal(result.code, 1);
    assert.match(result.stderr, /Cannot find \.env in/);
    assert.match(result.stderr, /Copy \.env\.example to \.env/);
  });
});

describe('cli - syntax & security', () => {
  it('accepts comments, export prefixes and "=" inside values', async (t) => {
    const cwd = createProject(t, {
      '.env.example': '# required\nexport API_KEY=abc=123\n',
      '.env': '  # local only\nAPI_KEY = abc=123\n',
    });

    const result = await runCli(cwd);

    assert.equal(result.code, 0);
  });

  it('prints plain text (no ANSI) when NO_COLOR is set or stdout is piped', async (t) => {
    const cwd = createProject(t, {
      '.env.example': 'PORT=3000\n',
      '.env': 'PORT=8080\n',
    });

    const result = await runCli(cwd);

    assert.ok(!result.stdout.includes('\x1b['));
    assert.ok(!result.stderr.includes('\x1b['));
  });
});

describe('src/index.js - programmatic API', () => {
  it('re-exports the Functional Core', () => {
    assert.equal(typeof parseEnvKeys, 'function');
    assert.equal(typeof diffEnvKeys, 'function');
    assert.equal(typeof formatReport, 'function');
    assert.equal(typeof checkEnvParity, 'function');
  });

  it('checkEnvParity returns the diff plus a printable report', () => {
    const result = checkEnvParity('PORT=3000\nDB_URL=x\n', 'PORT=8080\nDB_URL=y\n', {
      noColor: true,
    });

    assert.deepEqual(result.missing, []);
    assert.deepEqual(result.extra, []);
    assert.equal(result.isSynced, true);
    assert.equal(result.report, '✔ All environment variables are synchronized!');
  });

  it('checkEnvParity never exposes values', () => {
    const result = checkEnvParity('API_KEY=example\n', 'OTHER_KEY=super-secret\n', {
      noColor: true,
    });

    assert.deepEqual(result.missing, ['API_KEY']);
    assert.equal(result.isSynced, false);
    assert.ok(!JSON.stringify(result).includes('super-secret'));
  });
});

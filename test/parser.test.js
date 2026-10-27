/**
 * @file Unit tests for src/parser.js.
 *
 * Uses only Node.js built-ins: `node:test`, `node:assert/strict` and `node:fs`
 * (fixtures are read here in the test shell, never inside the module).
 */

import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseEnvKeys } from '../src/parser.js';

/**
 * Read a fixture from `test/fixtures` relative to this test file.
 *
 * @param {string} name Fixture file name.
 * @returns {string} Raw UTF-8 content.
 */
function fixture(name) {
  return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
}

describe('parseEnvKeys - fixtures', () => {
  it('extracts every key from valid.env.example in declaration order', () => {
    assert.deepEqual(parseEnvKeys(fixture('valid.env.example')), [
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'LOG_LEVEL',
    ]);
  });

  it('extracts every key from valid.env in declaration order', () => {
    assert.deepEqual(parseEnvKeys(fixture('valid.env')), [
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'LOG_LEVEL',
    ]);
  });

  it('parses edge-cases.env (comments, export, spacing, "=" in values, duplicates)', () => {
    assert.deepEqual(parseEnvKeys(fixture('edge-cases.env')), [
      'API_KEY',
      'DB_PASSWORD',
      'TAB_EXPORTED',
      'EMPTY_VALUE',
      'EQUALS_IN_VALUE',
      'INLINE_COMMENT',
      'DUPLICATED',
      'ONLY_ONCE',
    ]);
  });
});

describe('parseEnvKeys - degenerated input', () => {
  it('returns an empty list for an empty string', () => {
    assert.deepEqual(parseEnvKeys(''), []);
  });

  it('returns an empty list for whitespace-only content', () => {
    assert.deepEqual(parseEnvKeys('   \n\t\n  \r\n'), []);
  });

  it('returns an empty list for non-string input', () => {
    assert.deepEqual(parseEnvKeys(undefined), []);
    assert.deepEqual(parseEnvKeys(null), []);
    assert.deepEqual(parseEnvKeys(42), []);
  });

  it('returns an empty list when the file only contains comments', () => {
    assert.deepEqual(parseEnvKeys('# A=1\n#B=2\n   # C=3'), []);
  });

  it('ignores commented-out keys', () => {
    assert.deepEqual(parseEnvKeys('REAL=1\n# DISABLED_KEY=1'), ['REAL']);
  });
});

describe('parseEnvKeys - dotenv syntax', () => {
  it('strips the export prefix written with spaces or a tab', () => {
    assert.deepEqual(parseEnvKeys('export API_KEY=1\nexport\tTAB_KEY=2'), [
      'API_KEY',
      'TAB_KEY',
    ]);
  });

  it('takes the key before the first "=" only', () => {
    assert.deepEqual(parseEnvKeys('TOKEN=abc=123\nURL=https://x.test/?a=b'), [
      'TOKEN',
      'URL',
    ]);
  });

  it('keeps keys with empty values', () => {
    assert.deepEqual(parseEnvKeys('EMPTY=\nALSO_EMPTY='), ['EMPTY', 'ALSO_EMPTY']);
  });

  it('trims whitespace around the key and the line', () => {
    assert.deepEqual(parseEnvKeys('  PORT = 3000  \n\t DB_URL=x\t'), ['PORT', 'DB_URL']);
  });

  it('accepts dots, dashes and underscores in keys', () => {
    assert.deepEqual(parseEnvKeys('DB.HOST=1\nMY-KEY=2\nMY_KEY=3'), [
      'DB.HOST',
      'MY-KEY',
      'MY_KEY',
    ]);
  });

  it('skips lines without "=", empty keys and keys containing spaces', () => {
    assert.deepEqual(parseEnvKeys('NO_EQUALS\n=ORPHAN\nBAD KEY=1\nGOOD=1'), ['GOOD']);
  });

  it('handles CRLF, CR and BOM-prefixed content', () => {
    assert.deepEqual(parseEnvKeys('\uFEFFA=1\r\nB=2\rC=3\nD=4'), ['A', 'B', 'C', 'D']);
  });
});

describe('parseEnvKeys - ordering & uniqueness', () => {
  it('removes duplicates but keeps the first-seen order', () => {
    assert.deepEqual(parseEnvKeys('B=1\nA=2\nB=3\nC=4\nA=5'), ['B', 'A', 'C']);
  });

  it('never returns values, only names', () => {
    const keys = parseEnvKeys('SECRET=top-secret-value\nTOKEN=abc=123');

    assert.deepEqual(keys, ['SECRET', 'TOKEN']);
    assert.ok(!JSON.stringify(keys).includes('top-secret-value'));
    assert.ok(!JSON.stringify(keys).includes('abc=123'));
  });
});

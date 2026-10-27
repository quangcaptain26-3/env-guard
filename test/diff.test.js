/**
 * @file Unit tests for src/diff.js.
 *
 * Uses only Node.js built-ins: `node:test`, `node:assert/strict` and `node:fs`.
 */

import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { diffEnvKeys } from '../src/diff.js';
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

describe('diffEnvKeys - parity scenarios', () => {
  it('reports synchronized when both key sets are identical', () => {
    assert.deepEqual(diffEnvKeys(['PORT', 'DB_URL'], ['PORT', 'DB_URL']), {
      missing: [],
      extra: [],
      isSynced: true,
    });
  });

  it('reports synchronized for two empty sets', () => {
    assert.deepEqual(diffEnvKeys([], []), {
      missing: [],
      extra: [],
      isSynced: true,
    });
  });

  it('detects a missing key and marks the result as not synced', () => {
    assert.deepEqual(diffEnvKeys(['PORT', 'DB_URL', 'STRIPE_KEY'], ['PORT', 'DB_URL']), {
      missing: ['STRIPE_KEY'],
      extra: [],
      isSynced: false,
    });
  });

  it('treats extra keys as a warning only (still synced)', () => {
    assert.deepEqual(diffEnvKeys(['PORT'], ['PORT', 'LEGACY']), {
      missing: [],
      extra: ['LEGACY'],
      isSynced: true,
    });
  });

  it('reports missing and extra keys together', () => {
    assert.deepEqual(diffEnvKeys(['PORT', 'DB_URL'], ['PORT', 'LEGACY']), {
      missing: ['DB_URL'],
      extra: ['LEGACY'],
      isSynced: false,
    });
  });
});

describe('diffEnvKeys - empty inputs', () => {
  it('reports every example key as missing when the env file is empty', () => {
    assert.deepEqual(diffEnvKeys(['PORT', 'DB_URL'], []), {
      missing: ['PORT', 'DB_URL'],
      extra: [],
      isSynced: false,
    });
  });

  it('reports every env key as extra when the example file is empty', () => {
    assert.deepEqual(diffEnvKeys([], ['PORT', 'DB_URL']), {
      missing: [],
      extra: ['PORT', 'DB_URL'],
      isSynced: true,
    });
  });

  it('treats non-array input as an empty list', () => {
    assert.deepEqual(diffEnvKeys(undefined, null), {
      missing: [],
      extra: [],
      isSynced: true,
    });
  });
});

describe('diffEnvKeys - ordering & uniqueness', () => {
  it('preserves example order for missing keys', () => {
    assert.deepEqual(diffEnvKeys(['C', 'A', 'B'], []).missing, ['C', 'A', 'B']);
  });

  it('preserves env order for extra keys', () => {
    assert.deepEqual(diffEnvKeys([], ['Z', 'M', 'A']).extra, ['Z', 'M', 'A']);
  });

  it('collapses duplicates in both inputs', () => {
    assert.deepEqual(diffEnvKeys(['A', 'A', 'B'], ['B', 'B', 'C', 'C']), {
      missing: ['A'],
      extra: ['C'],
      isSynced: false,
    });
  });

  it('does not mutate the input arrays', () => {
    const exampleKeys = ['A', 'B'];
    const envKeys = ['A', 'EXTRA'];

    diffEnvKeys(exampleKeys, envKeys);

    assert.deepEqual(exampleKeys, ['A', 'B']);
    assert.deepEqual(envKeys, ['A', 'EXTRA']);
  });
});

describe('diffEnvKeys - fixture integration', () => {
  it('reports the valid fixture pair as synchronized', () => {
    const exampleKeys = parseEnvKeys(fixture('valid.env.example'));
    const envKeys = parseEnvKeys(fixture('valid.env'));

    assert.deepEqual(diffEnvKeys(exampleKeys, envKeys), {
      missing: [],
      extra: [],
      isSynced: true,
    });
  });

  it('reports all template keys as missing against edge-cases.env', () => {
    const exampleKeys = parseEnvKeys(fixture('valid.env.example'));
    const envKeys = parseEnvKeys(fixture('edge-cases.env'));
    const result = diffEnvKeys(exampleKeys, envKeys);

    assert.deepEqual(result.missing, ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'LOG_LEVEL']);
    assert.equal(result.isSynced, false);
    assert.ok(result.extra.includes('API_KEY'));
  });
});

/**
 * @file Unit tests for src/format.js.
 *
 * Closes the coverage gap left after Phase 3: verifies the ANSI codes behind
 * AC-1 (green success), AC-2 (red missing) and the `NO_COLOR` fallback.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { formatReport } from '../src/format.js';

const ESC = '\x1b[';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Run `fn` with `NO_COLOR` temporarily removed, restoring it afterwards.
 *
 * @param {() => void} fn Body to execute.
 * @returns {void}
 */
function withoutNoColor(fn) {
  const had = Object.prototype.hasOwnProperty.call(process.env, 'NO_COLOR');
  const previous = process.env.NO_COLOR;
  delete process.env.NO_COLOR;

  try {
    fn();
  } finally {
    if (had) {
      process.env.NO_COLOR = previous;
    } else {
      delete process.env.NO_COLOR;
    }
  }
}

describe('formatReport - success', () => {
  it('prints the synchronized message in green', () => {
    withoutNoColor(() => {
      const output = formatReport({ missing: [], extra: [], isSynced: true });

      assert.ok(output.startsWith(GREEN));
      assert.ok(output.includes('✔ All environment variables are synchronized!'));
      assert.ok(output.endsWith(RESET));
    });
  });

  it('reports extra keys as a yellow warning without failing', () => {
    withoutNoColor(() => {
      const output = formatReport({ missing: [], extra: ['LEGACY'], isSynced: true });

      assert.ok(output.includes(GREEN));
      assert.ok(output.includes('All required environment variables are present.'));
      assert.ok(output.includes(`${YELLOW}! Extra environment variables (1):${RESET}`));
      assert.ok(output.includes('LEGACY'));
    });
  });
});

describe('formatReport - failures', () => {
  it('prints missing keys in red', () => {
    withoutNoColor(() => {
      const output = formatReport({ missing: ['DB_URL'], extra: [], isSynced: false });

      assert.ok(output.startsWith(`${RED}✖ Missing environment variables (1):${RESET}`));
      assert.ok(output.includes(`${RED}  - DB_URL${RESET}`));
    });
  });

  it('renders missing and extra blocks in red then yellow', () => {
    withoutNoColor(() => {
      const output = formatReport({
        missing: ['A'],
        extra: ['B'],
        isSynced: false,
      });

      assert.ok(output.indexOf(RED) < output.indexOf(YELLOW));
      assert.ok(output.includes(`${YELLOW}! Extra environment variables (1):${RESET}`));
    });
  });
});

describe('formatReport - color control', () => {
  it('honours options.noColor === true', () => {
    const output = formatReport({ missing: ['A'], extra: [], isSynced: false }, { noColor: true });

    assert.ok(!output.includes(ESC));
    assert.equal(output, '✖ Missing environment variables (1):\n  - A');
  });

  it('honours a non-empty NO_COLOR environment variable', () => {
    withoutNoColor(() => {
      process.env.NO_COLOR = '1';
      try {
        const output = formatReport({ missing: [], extra: [], isSynced: true });
        assert.ok(!output.includes(ESC));
      } finally {
        delete process.env.NO_COLOR;
      }
    });
  });

  it('keeps colors when NO_COLOR is set but empty', () => {
    withoutNoColor(() => {
      process.env.NO_COLOR = '';
      try {
        const output = formatReport({ missing: [], extra: [], isSynced: true });
        assert.ok(output.startsWith(GREEN));
      } finally {
        delete process.env.NO_COLOR;
      }
    });
  });

  it('lets options.noColor win over the environment', () => {
    withoutNoColor(() => {
      const output = formatReport({ missing: [], extra: [], isSynced: true }, { noColor: false });
      assert.ok(output.startsWith(GREEN));
    });
  });
});

describe('formatReport - safety', () => {
  it('returns no trailing newline', () => {
    const output = formatReport({ missing: ['A'], extra: [], isSynced: false }, { noColor: true });
    assert.ok(!output.endsWith('\n'));
  });

  it('renders only key names, never values', () => {
    const output = formatReport(
      { missing: ['API_KEY'], extra: ['OLD_TOKEN'], isSynced: false },
      { noColor: true },
    );

    assert.ok(output.includes('API_KEY'));
    assert.ok(output.includes('OLD_TOKEN'));
    assert.ok(!output.includes('='));
  });

  it('tolerates malformed diff results', () => {
    assert.equal(
      formatReport({}, { noColor: true }),
      '✔ All environment variables are synchronized!',
    );
    assert.equal(formatReport(undefined, { noColor: true }), '✔ All environment variables are synchronized!');
  });
});

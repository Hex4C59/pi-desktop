import assert from 'node:assert/strict';
import test from 'node:test';

import { runDocsVerify } from './docs-verify-lib.mjs';

test('runDocsVerify on repository has no structural errors', () => {
  const { errors } = runDocsVerify();
  assert.equal(errors.length, 0, errors.map((e) => e.message).join('\n'));
});

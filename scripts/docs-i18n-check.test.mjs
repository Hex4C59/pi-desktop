import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  englishPathForZh,
  extractFencedCodeBlocks,
  extractRelativeLinks,
  parseSwitcher,
  parseZhMetadata,
  runDocsI18nCheck,
  zhPathForEnglish,
} from './docs-i18n-check-lib.mjs';

test('path pairing helpers', () => {
  assert.equal(englishPathForZh('docs/foo.zh.md'), 'docs/foo.md');
  assert.equal(zhPathForEnglish('docs/foo.md'), 'docs/foo.zh.md');
});

test('parseSwitcher accepts canonical lines', () => {
  const en = '# Title\n\nEnglish | [中文](foo.zh.md)\n';
  const zh = '# 标题\n\n[English](foo.md) | 中文\n';
  assert.equal(parseSwitcher(en, 'en').ok, true);
  assert.equal(parseSwitcher(en, 'en').target, 'foo.zh.md');
  assert.equal(parseSwitcher(zh, 'zh').ok, true);
  assert.equal(parseSwitcher(zh, 'zh').target, 'foo.md');
});

test('parseZhMetadata reads translation fields', () => {
  const content = `
# x

[English](a.md) | 中文

- 翻译状态：Human Reviewed
- 权威原文：[a.md](a.md)
- 原文版本：\`deadbeef\`
- 最近同步：2026-09-18
`;
  const meta = parseZhMetadata(content);
  assert.equal(meta.translationStatus, 'Human Reviewed');
  assert.equal(meta.sourceRevision.kind, 'commit');
  assert.equal(meta.sourceRevision.value, 'deadbeef');
  assert.equal(meta.lastSync, '2026-09-18');
});

test('extractRelativeLinks ignores fenced examples', () => {
  const md = 'See [ok](real.md).\n\n```md\n[fake](missing.md)\n```\n';
  assert.deepEqual(extractRelativeLinks(md), ['real.md']);
});

test('extractFencedCodeBlocks preserves body', () => {
  const md = '```ts\nconst x = 1;\n```\n';
  const blocks = extractFencedCodeBlocks(md);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].info, 'ts');
  assert.equal(blocks[0].body, 'const x = 1;\n');
});

test('runDocsI18nCheck flags missing metadata in temp repo', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-docs-i18n-'));
  const en = path.join(tmp, 'sample.md');
  const zh = path.join(tmp, 'sample.zh.md');
  fs.writeFileSync(
    en,
    '# Sample\n\nEnglish | [中文](sample.zh.md)\n\n```\ncode\n```\n',
    'utf8',
  );
  fs.writeFileSync(
    zh,
    '# 样例\n\n[English](sample.md) | 中文\n\n```\ncode\n```\n',
    'utf8',
  );
  const result = runDocsI18nCheck({ rootDir: tmp });
  assert.ok(result.errors.some((e) => e.code === 'zh-meta-status'));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('repository docs:i18n:check passes', () => {
  const result = runDocsI18nCheck();
  if (result.errors.length > 0) {
    console.error(
      result.errors.map((e) => `${e.file}: ${e.message}`).join('\n'),
    );
  }
  assert.equal(result.errors.length, 0);
});

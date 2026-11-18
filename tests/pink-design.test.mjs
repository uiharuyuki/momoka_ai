import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
const talk = readFileSync(new URL('../src/pages/TalkPage.tsx', import.meta.url), 'utf8')
test('Talk uses the approved illustration rather than the placeholder or generated UI screenshot', () => {
  assert.match(talk, /<img[^>]+className="momoka-portrait"/)
  assert.match(talk, /momoka-approved\.webp/)
  assert.doesNotMatch(talk, /CHARACTER PLACEHOLDER/)
  assert.ok(existsSync(new URL('../src/assets/momoka-approved.webp', import.meta.url)))
})
test('The review is labelled honestly and preserves its fixed reply boundary', () => {
  assert.match(talk, /デザイン確認用/)
  assert.match(talk, /実際のAIには送信/)
  assert.doesNotMatch(talk, /fetch\s*\(/)
})

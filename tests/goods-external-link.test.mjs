import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
const page = readFileSync(new URL('../src/pages/ContentPages.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
test('Goods opens the published external demo through real accessible links', () => {
  assert.match(page, /const externalGoodsUrl = 'https:\/\/uiharuyuki\.github\.io\/momoka-goods-demo\/'/)
  assert.match(page, /href=\{externalGoodsUrl\} target="_blank" rel="noopener noreferrer"/)
  assert.match(page, /href=\{`\$\{externalGoodsUrl\}#\/items`\} target="_blank" rel="noopener noreferrer"/)
  assert.doesNotMatch(page, /URL未設定|URLが未設定|disabled>外部/)
  assert.match(page, /新しいタブ/)
  assert.match(page, /購入はできません/)
})
test('anchor CTAs keep the existing button geometry', () => {
  assert.match(css, /\.goods-card \.button-link/)
  assert.match(css, /\.external-store \.button-link/)
})

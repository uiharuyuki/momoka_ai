import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const talk = readFileSync(new URL('../src/pages/TalkPage.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const vite = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8')

test('Talk starts character-first and transitions once into the conversation layout', () => {
  assert.match(talk, /useState<TalkMode>\('intro'\)/)
  assert.match(talk, /setMode\('conversation'\)/)
  assert.match(talk, /レイアウト確認用の固定返信/)
  assert.doesNotMatch(talk, /fetch\s*\(/)
})

test('desktop and mobile layout ratios are encoded in the wireframe', () => {
  assert.match(css, /\.talk-page-conversation[^}]*grid-template-columns:\s*minmax\(0,\s*57fr\)\s+minmax\(360px,\s*43fr\)/s)
  assert.match(css, /\.talk-page-intro[^}]*grid-template-columns:\s*1fr/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)/)
  assert.match(css, /grid-template-rows:\s*minmax\(150px,\s*30dvh\)\s+minmax\(0,\s*1fr\)/)
})

test('composer uses a round accessible send control like the target UI', () => {
  assert.match(talk, /aria-label="送信"/)
  assert.match(talk, /className="send-icon"/)
  assert.match(css, /\.message-form button[^}]*width:\s*54px[^}]*height:\s*54px[^}]*border-radius:\s*50%/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.message-form button[^}]*width:\s*44px[^}]*height:\s*44px/s)
})

test('composer outer frame is a production-shaped capsule rather than a square wireframe box', () => {
  assert.match(css, /\.message-form\s*\{[^}]*border:\s*1px solid var\(--line\)[^}]*border-radius:\s*999px/s)
  assert.doesNotMatch(css, /\.message-form\s*\{[^}]*border-top:/s)
  assert.match(css, /\.message-form input\s*\{[^}]*border:\s*0[^}]*background:\s*transparent/s)
})

test('GitHub Pages build uses hash routing and the repository base path', () => {
  assert.match(main, /HashRouter/)
  assert.match(vite, /base:\s*'\/momoka_ai\/'/)
})

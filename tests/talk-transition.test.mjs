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

test('GitHub Pages build uses hash routing and the repository base path', () => {
  assert.match(main, /HashRouter/)
  assert.match(vite, /base:\s*'\/momoka_ai\/'/)
})

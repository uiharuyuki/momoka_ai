import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const talk = readFileSync(new URL('../src/pages/TalkPage.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/pages/TalkDesign.css', import.meta.url), 'utf8')

test('Talk intro composes separate street and transparent portrait assets in a cropped stage', () => {
  assert.match(css, /url\('\.\.\/assets\/shopping-street-background\.webp'\)/)
  assert.match(talk, /momoka-tapioca\.webp/)
  assert.match(talk, /className="hero-topic" type="button"/)
  assert.doesNotMatch(talk, /momoka-approved\.webp|cafe-door|cafe-wave|CafeThoughts/)
  assert.match(css, /\.talk-page \.character-stage[\s\S]*?overflow: hidden/)
  assert.match(css, /\.talk-page \.momoka-portrait[\s\S]*?height: auto/)
})

test('the suggested question is accessible and only prefills the editable composer', () => {
  assert.match(talk, /onClick=\{\(\) => onChoose\(topic\.question\)\}/)
  assert.match(talk, /previous\.endsWith\(question\) \? previous : previous \+ ' ' \+ question/)
  assert.match(talk, /onChange=\{\(event\) => setInput\(event\.target\.value\)\}/)
  assert.match(talk, /デモ用の固定返信だよ。今日はタピオカ/)
  assert.match(talk, /DESIGN PREVIEW · 固定返信/)
})

test('rotating topic suggestions and an editable form serve desktop and mobile', () => {
  assert.match(talk, /onAnimationIteration=\{\(\) => cycle\(index\)\}/)
  assert.match(css, /topic-cycle 16s/)
  assert.match(css, /animation-delay: -8s/)
  assert.match(talk, /<form className="message-form" onSubmit={sendMessage}>/)
  assert.match(talk, /type="submit" aria-label="送信"/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.doesNotMatch(css, /layout-target\.png|momoka-shopping-street\.webp/)
})

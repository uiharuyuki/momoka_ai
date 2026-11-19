import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const talk = readFileSync(new URL('../src/pages/TalkPage.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/pages/TalkDesign.css', import.meta.url), 'utf8')

test('Talk mock shows a pending three-dot reply before the fixed response', () => {
  assert.match(talk, /setReplyPending\(true\)/)
  assert.match(talk, /setTimeout\(\(\) => \{[\s\S]*setMessages\(\(previous\) => \[\.\.\.previous, \{ id: answerId, role: 'character', text: mockReply \}\]\)[\s\S]*\}, 650\)/)
  assert.match(talk, /className="typing-dots"[\s\S]*<span>•<\/span><span>•<\/span><span>•<\/span>/)
  assert.match(talk, /DESIGN PREVIEW · 固定返信/)
  assert.match(talk, /実際のAIには送信しません/)
  assert.doesNotMatch(talk, /fetch\s*\(/)
})

test('Talk composer has a dark frame, rose focus, and reduced-motion-safe reply effects', () => {
  assert.match(css, /\.message-form input\s*\{[^}]*border:\s*1px solid #1f1718/s)
  assert.match(css, /\.message-form input:focus-visible\s*\{[^}]*#d87596/s)
  assert.match(css, /\.message-character \.message-content\s*\{[^}]*talk-reply-in/s)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.message-character \.message-content, \.typing-dots span\s*\{\s*animation:\s*none/s)
})

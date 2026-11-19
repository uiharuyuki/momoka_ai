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

test('Talk composer has no dark frame, uses rose form focus, and avoids a double input ring', () => {
  assert.doesNotMatch(css, /#1f1718/)
  assert.match(css, /\.message-form\s*\{[^}]*border-color:\s*#bd7a8d/s)
  assert.match(css, /\.message-form:focus-within\s*\{[^}]*border-color:\s*#b85c76[^}]*box-shadow:\s*0 0 0 3px rgb\(184 92 118 \/ 20%\)/s)
  assert.match(css, /\.message-form input\s*\{[^}]*border:\s*0[^}]*outline:\s*none/s)
  assert.doesNotMatch(css, /\.message-form input:focus(?:-visible)?\s*\{/)
  assert.match(css, /\.message-form button:not\(:disabled\)\s*\{[^}]*transition:/s)
  assert.match(css, /\.message-form button:not\(:disabled\):hover/)
  assert.match(css, /\.message-character \.message-content\s*\{[^}]*talk-reply-in/s)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.message-character \.message-content, \.typing-dots span\s*\{\s*animation:\s*none/s)
})

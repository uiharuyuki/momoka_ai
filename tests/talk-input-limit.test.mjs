import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/pages/TalkPage.tsx', import.meta.url), 'utf8')
const body = source.match(/function countInput\(text: string\) \{([^}]+)\}/)[1]
const count = new Function('text', body)
test('Talk limit counts trimmed Unicode code points at the 100 boundary', () => {
  for (const unit of ['あ', '😀']) {
    assert.equal(count(unit.repeat(100)), 100)
    assert.equal(count(unit.repeat(101)), 101)
    assert.equal(count(`  ${unit.repeat(100)}  `), 100)
  }
  assert.equal(count('  '), 0)
  assert.equal(count('a b'), 3)
})
test('Talk blocks over-limit sends without truncating pasted or IME input', () => {
  assert.match(source, /countInput\(text\) > INPUT_LIMIT \|\| composing.current/)
  assert.match(source, /disabled=\{!input.trim\(\) \|\| countInput\(input\) > INPUT_LIMIT/)
  assert.match(source, /onChange=\{\(event\) => setInput\(event.target.value\)\}/)
  assert.match(source, /onCompositionStart/)
  assert.match(source, /aria-describedby="input-limit"/)
  assert.doesNotMatch(source, /maxLength=\{400\}|slice\(0, 100\)/)
})

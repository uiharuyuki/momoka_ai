import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const css=readFileSync(new URL('../src/pages/TalkDesign.css',import.meta.url),'utf8')
test('the painted eyes anchor the portrait while the viewport crops the lower body', () => {
  const scene = css.slice(css.indexOf('/* Both Talk modes'))
  const portrait = scene.match(/\.talk-page \.momoka-portrait\s*\{([^}]+)\}/)[1]
  assert.match(portrait, /position: absolute/)
  assert.match(portrait, /width: min\([^;]+vw, [^;]+dvh\)/)
  assert.match(portrait, /transform-origin: 64\.1% 23\.2%/)
  assert.match(portrait, /height: auto/)
})

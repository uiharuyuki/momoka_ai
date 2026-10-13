import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const app = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')
const base = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const wireframe = readFileSync(new URL('../src/components/Wireframe.tsx', import.meta.url), 'utf8')

test('shared navigation follows the generated comp shape on desktop and mobile', () => {
  assert.match(wireframe, /className="brand-wordmark"/)
  assert.match(wireframe, /className="navigation-icon"/)
  assert.match(app, /\.logo-placeholder[^}]*border:\s*0[^}]*background:\s*transparent/s)
  assert.match(app, /@media\s*\(max-width:\s*720px\)[\s\S]*\.site-header nav[^}]*position:\s*fixed[^}]*bottom:\s*0/s)
  assert.match(app, /@media\s*\(max-width:\s*720px\)[\s\S]*\.navigation[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s)
})

test('Talk geometry uses the slimmer production-sized composer and rounded chat surfaces', () => {
  assert.match(app, /\.intro-composer[^}]*width:\s*min\(760px,/s)
  assert.match(app, /\.message-form\s*\{[^}]*padding:\s*4px[^}]*border-radius:\s*999px/s)
  assert.match(app, /\.message-form button[^}]*width:\s*48px[^}]*height:\s*48px[^}]*border-radius:\s*50%/s)
  assert.match(app, /\.message-content[^}]*border-radius:\s*18px/s)
  assert.match(app, /\.conversation-panel[^}]*border-radius:\s*28px/s)
  assert.match(app, /@media\s*\(max-width:\s*720px\)[\s\S]*\.intro-composer[^}]*width:\s*calc\(100%\s*-\s*40px\)/s)
})

test('Profile, Activities, Voice, and Goods use one rounded production card language', () => {
  assert.match(base, /button,\s*\.button-link[^}]*border-radius:\s*999px/s)
  for (const selector of ['wire-card', 'activity-card', 'voice-card', 'goods-card']) {
    assert.match(app, new RegExp(`\\.${selector}[^}]*border-radius:\\s*24px`, 's'))
  }
  assert.match(app, /\.activity-filters button[^}]*border-radius:\s*999px/s)
  assert.match(app, /\.product-image[^}]*border-radius:\s*18px/s)
  assert.match(app, /\.wire-dialog[^}]*border-radius:\s*24px/s)
})

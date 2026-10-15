import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const profile = readFileSync(new URL('../src/pages/ContentPages.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

test('Profile opens as a character-first AI VTuber hero instead of a document grid', () => {
  for (const className of ['profile-hero', 'profile-visual', 'profile-identity', 'profile-intro-copy', 'profile-facts', 'profile-about', 'profile-ai-section', 'profile-related']) {
    assert.match(profile, new RegExp(`className="${className}`))
  }
  assert.match(profile, /<h1[^>]*>小鳥遊ももか<\/h1>/)
  assert.match(profile, /MOMOKA TAKANASHI/)
  assert.match(profile, /AI VTUBER/)
  assert.doesNotMatch(profile, /BASIC PROFILE|SPEECH STYLE|CHARACTER DETAILS/)
})

test('Profile keeps one pose and expression viewer but does not turn outfits into a Profile feature', () => {
  assert.match(profile, /const profileViews = \[/)
  assert.match(profile, /通常/)
  assert.match(profile, /笑顔/)
  assert.match(profile, /考え中/)
  assert.match(profile, /className="profile-view-switcher"/)
  assert.match(profile, /aria-pressed=\{characterView === view\.id\}/)
  assert.doesNotMatch(profile, /衣装切替|COSTUME/)
})

test('Profile provides Talk and Voice routes without embedding a full audio library', () => {
  assert.match(profile, /to="\/"[^>]*>ももかと話す<\/Link>/)
  assert.match(profile, /to="\/voice"[^>]*>声を聴く<\/Link>/)
  assert.doesNotMatch(profile, /<audio/)
})

test('Profile geometry prioritizes character art and collapses in mobile reading order', () => {
  assert.match(css, /\.profile-hero[^}]*grid-template-columns:\s*minmax\(0,\s*56fr\)\s*minmax\(360px,\s*44fr\)/s)
  assert.match(css, /\.profile-visual[^}]*grid-row:\s*1\s*\/\s*3[^}]*min-height:\s*min\(68vh,\s*680px\)/s)
  assert.match(css, /\.profile-view-switcher[^}]*border-radius:\s*999px/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.profile-hero[^}]*grid-template-columns:\s*1fr/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.profile-identity[^}]*grid-row:\s*1/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.profile-visual[^}]*grid-row:\s*2/s)
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.profile-intro-copy[^}]*grid-row:\s*3/s)
})

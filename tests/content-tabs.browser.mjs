import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Build first. Run against a local preview, or a supplied static review URL.
const base = process.env.UI_BASE_URL || 'http://127.0.0.1:4175/momoka_ai/'
const output = process.env.UI_ARTIFACT_DIR || await mkdtemp(join(tmpdir(), 'momoka-ui-'))
await mkdir(output, { recursive: true })
let server
let browser
const results = []
async function check(name, run) {
  await run()
  results.push({ name, status: 'passed' })
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2))
  console.log('PASS ' + name)
}
try {
  if (!process.env.UI_BASE_URL) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'pipe' })
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('preview did not become ready')), 15000)
      server.once('error', reject)
      server.once('exit', code => { clearTimeout(timeout); reject(Error('preview exited: ' + code)) })
      server.stdout.on('data', chunk => { if (chunk.toString().includes('Local:')) { clearTimeout(timeout); resolve() } })
    })
  }
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), args: ['--no-sandbox'] })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const pageErrors = []
  const apiRequests = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url()) })
  async function route(name) {
    await page.goto(base + '#/' + name)
    await page.locator('#main-content').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  // Capture every requested tab even on the pre-implementation RED run.
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    for (const tab of ['activities', 'voice', 'goods']) {
      await route(tab)
      await page.screenshot({ path: join(output, `${tab}-${width}.png`), fullPage: true })
    }
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    await route('activities')
    await check(`Activities ${width}: feature, filtering and correct counts`, async () => {
      await page.locator('.activity-feature').waitFor({ timeout: 2500 })
      assert.equal(await page.locator('.activity-card').count(), 6)
      await page.getByRole('group', { name: '活動カテゴリ' }).getByRole('button', { name: '動画', exact: true }).click()
      assert.equal(await page.locator('.activity-card').count(), 2)
      assert.match(await page.locator('.catalog-count').innerText(), /2/)
      assert.equal(await page.getByRole('button', { name: '動画', exact: true }).getAttribute('aria-pressed'), 'true')
      await page.getByRole('button', { name: 'すべて', exact: true }).click()
    })
    await check(`Activities ${width}: detail, Escape and focus restoration`, async () => {
      const button = page.locator('.activity-card button').first()
      await button.click()
      const dialog = page.getByRole('dialog')
      await dialog.waitFor()
      assert.match(await dialog.innerText(), /サンプル/)
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('dialog[open]').count(), 0)
      assert.equal(await button.evaluate(el => document.activeElement === el), true)
    })
    await route('voice')
    await check(`Voice ${width}: selected track changes without fake playback`, async () => {
      assert.equal(await page.locator('.voice-card').count(), 6)
      await page.getByRole('group', { name: '音声カテゴリ' }).getByRole('button', { name: '気持ち', exact: true }).click()
      assert.equal(await page.locator('.voice-card').count(), 2)
      await page.locator('.voice-card .voice-select').last().click()
      assert.match(await page.locator('.voice-spotlight h2').innerText(), /ありがとう/)
      assert.equal(await page.locator('.voice-play').isDisabled(), true)
      assert.equal(await page.locator('.voice-seek').isDisabled(), true)
      assert.equal(await page.locator('audio').count(), 0)
      await page.getByText('台詞例を見る', { exact: true }).click()
      assert.equal(await page.locator('.voice-script').getAttribute('open'), '')
      assert.match(await page.locator('.voice-script').innerText(), /台詞は確認用/)
      await page.getByRole('button', { name: 'すべて', exact: true }).click()
    })
    await route('goods')
    await check(`Goods ${width}: category filtering and product details`, async () => {
      assert.equal(await page.locator('.goods-card').count(), 6)
      await page.getByRole('group', { name: '商品カテゴリ' }).getByRole('button', { name: 'アクリル', exact: true }).click()
      assert.equal(await page.locator('.goods-card').count(), 2)
      await page.locator('.goods-card button').first().click()
      const dialog = page.getByRole('dialog')
      await dialog.waitFor()
      await dialog.getByRole('button', { name: '裏面', exact: true }).click()
      assert.equal(await dialog.getByRole('button', { name: '裏面', exact: true }).getAttribute('aria-pressed'), 'true')
      assert.match(await dialog.locator('.catalog-art-label').innerText(), /裏面/)
      assert.equal(await dialog.getByRole('button', { name: '販売準備中' }).isDisabled(), true)
      await dialog.getByRole('button', { name: '閉じる', exact: true }).click()
      assert.equal(await page.locator('dialog[open]').count(), 0)
      await page.getByRole('button', { name: 'すべて', exact: true }).click()
    })
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 })
    for (const tab of ['', 'profile', 'activities', 'voice', 'goods']) {
      await route(tab)
      await check(`${tab || 'talk'} ${width}: no horizontal overflow`, async () => {
        const dims = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
        assert.ok(dims.scroll <= dims.client, JSON.stringify(dims))
      })
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  for (const tab of ['activities', 'voice', 'goods']) {
    await route(tab)
    await check(`${tab} mobile: controls, focus ring and bottom safe area`, async () => {
      const sizes = await page.locator('#main-content button:not(:disabled)').evaluateAll(buttons => buttons.map(b => ({ h: b.getBoundingClientRect().height, w: b.getBoundingClientRect().width })))
      assert.ok(sizes.every(s => s.h >= 44 && s.w >= 44), JSON.stringify(sizes))
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      const clear = await page.evaluate(() => document.querySelector('.catalog-return').getBoundingClientRect().bottom <= window.innerHeight + 1)
      assert.equal(clear, true)
      const control = page.locator('.catalog-filters button').first()
      await control.focus()
      assert.notEqual(await control.evaluate(el => getComputedStyle(el).outlineStyle), 'none')
    })
  }
  await check('No runtime errors or real API requests', async () => { assert.deepEqual(pageErrors, []); assert.deepEqual(apiRequests, []) })
  console.log(JSON.stringify({ passed: results.length, output }))
} finally {
  if (browser) await browser.close()
  if (server) server.kill('SIGTERM')
}

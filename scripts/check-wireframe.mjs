import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const baseUrl = 'http://127.0.0.1:5173'
const outputDirectory = resolve('artifacts/wireframe')
const chrome = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find((candidate) => candidate && existsSync(candidate))
assert.ok(chrome, 'Chromeが見つかりません。CHROME_PATHで実行ファイルを指定してください。')
assert.equal((await fetch(baseUrl)).status, 200, '先に指定のVite開発サーバーを起動してください。')
await mkdir(outputDirectory, { recursive: true })

const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run',
  '--no-default-browser-check', '--remote-debugging-port=0',
  `--user-data-dir=${resolve('node_modules/.cache/wireframe-browser')}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] })
console.log(`Started isolated Chrome PID ${browser.pid}`)

const report = { passed: false, viewport: '1440x900', checks: [], screenshots: [], consoleErrors: [], externalRequests: [] }
const pending = new Map()
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
let socket
let send
let nextId = 1

try {
  const endpoint = await new Promise((done, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome startup timed out')), 20000)
    let log = ''
    browser.stderr.on('data', (chunk) => {
      log += chunk.toString()
      const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/)
      if (match) { clearTimeout(timeout); done(match[1]) }
    })
    browser.once('error', (error) => { clearTimeout(timeout); reject(error) })
    browser.once('exit', (code) => { clearTimeout(timeout); reject(new Error(`Chrome exited: ${code}`)) })
  })
  socket = new WebSocket(endpoint)
  await new Promise((done, reject) => { socket.onopen = done; socket.onerror = reject })
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (pending.has(message.id)) {
      const task = pending.get(message.id)
      clearTimeout(task.timeout)
      pending.delete(message.id)
      if (message.error) task.reject(new Error(JSON.stringify(message.error)))
      else task.done(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') report.consoleErrors.push(message.params.exceptionDetails.text)
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.consoleErrors.push(JSON.stringify(message.params.args))
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') report.consoleErrors.push(message.params.entry.text)
    if (message.method === 'Network.requestWillBeSent') {
      const url = message.params.request.url
      if (/^https?:/.test(url) && new URL(url).origin !== baseUrl) report.externalRequests.push(url)
    }
  }
  send = (method, params = {}, sessionId) => new Promise((done, reject) => {
    const id = nextId++
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { done, reject, timeout })
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const page = (method, params) => send(method, params, sessionId)
  const evaluate = async (expression) => {
    const response = await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails))
    return response.result.value
  }
  const until = async (expression) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        if (await evaluate(expression)) return
      } catch (error) {
        if (!/context was destroyed|Cannot find context|Inspected target navigated/i.test(error.message)) throw error
      }
      await sleep(50)
    }
    throw new Error(`Timed out: ${expression}`)
  }
  const check = (label, actual, expected = true) => {
    assert.deepEqual(actual, expected, label)
    report.checks.push(label)
    console.log(`PASS ${label}`)
  }
  const click = async (selector) => {
    const point = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) throw new Error('Missing element'); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`)
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
    await sleep(60)
  }
  const navigate = async (path) => {
    await click(`.navigation a[href="${path}"]`)
    await until(`location.pathname === ${JSON.stringify(path)} && document.querySelector('h1') !== null`)
  }
  const screenshot = async (name) => {
    await evaluate('document.fonts.ready')
    const { cssContentSize } = await page('Page.getLayoutMetrics')
    const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 } })
    await writeFile(resolve(outputDirectory, `${name}.png`), Buffer.from(data, 'base64'))
    report.screenshots.push(`artifacts/wireframe/${name}.png`)
  }
  const viewport = (width, height, mobile = false) => page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
  const inputMessage = async (text) => {
    await evaluate("document.querySelector('#message-input').focus()")
    await page('Input.insertText', { text })
  }

  for (const domain of ['Page', 'Runtime', 'Log', 'Network']) await page(`${domain}.enable`)
  await viewport(1440, 900)
  await page('Page.navigate', { url: baseUrl })
  await until("document.querySelector('#message-input') !== null")
  check('Root renders Talk', await evaluate("document.querySelector('h1').textContent"), 'Talk')
  check('Navigation order, no Home', await evaluate("Array.from(document.querySelectorAll('.navigation a'), e => e.textContent)"), ['Talk', 'Profile', 'Activities', 'Voice', 'Goods'])
  check('Talk is the only active link', await evaluate("Array.from(document.querySelectorAll('.navigation a[aria-current=page]'), e => e.textContent)"), ['Talk'])
  check('Two example messages', await evaluate("document.querySelectorAll('.message').length"), 2)
  check('Talk fits viewport', await evaluate('document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth'))
  check('Talk body is locked', await evaluate("getComputedStyle(document.body).overflowY === 'hidden'"))
  await screenshot('talk')

  check('Empty send disabled', await evaluate("document.querySelector('.message-form button').disabled"))
  await inputMessage('   ')
  check('Whitespace send disabled', await evaluate("document.querySelector('.message-form button').disabled"))
  await inputMessage('動作確認のサンプル')
  await click('.message-form button')
  await until("document.querySelectorAll('.message').length === 4")
  check('User message appended', await evaluate("document.querySelectorAll('.message-user p')[1].textContent"), '動作確認のサンプル')
  check('Fixed mock reply appended', await evaluate("document.querySelector('.message:last-child p').textContent"), 'これは固定のモック回答です。送信されたメッセージを確認しました。')
  check('Input cleared and refocused', await evaluate("document.activeElement.id === 'message-input' && document.activeElement.value === ''"))
  await inputMessage('Enter送信')
  await page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' })
  await page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await until("document.querySelectorAll('.message').length === 6")
  check('Enter sends one message and one reply', await evaluate("document.querySelectorAll('.message').length"), 6)
  await inputMessage('日本語入力中')
  await evaluate("document.querySelector('#message-input').dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })); document.querySelector('.message-form').requestSubmit()")
  check('IME composition does not submit', await evaluate("document.querySelectorAll('.message').length"), 6)
  await evaluate("document.querySelector('#message-input').dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }))")
  await click('.message-form button')
  await until("document.querySelectorAll('.message').length === 8")

  await inputMessage('<img src=x onerror="window.wireframeInjected=true">')
  await click('.message-form button')
  check('Message text is escaped', await evaluate("document.querySelector('.conversation-history img') === null && window.wireframeInjected !== true"))
  for (let number = 0; number < 14; number++) {
    await inputMessage(`スクロール確認サンプル ${number + 1}`)
    await click('.message-form button')
  }
  check('History overflows internally', await evaluate("(() => { const e = document.querySelector('.conversation-history'); return e.scrollHeight > e.clientHeight && getComputedStyle(e).overflowY === 'auto'; })()"))
  const beforeScroll = await evaluate("({ top: document.querySelector('.conversation-history').scrollTop, inputY: document.querySelector('.message-form').getBoundingClientRect().y })")
  const point = await evaluate("(() => { const r = document.querySelector('.conversation-history').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()")
  await page('Input.dispatchMouseEvent', { type: 'mouseWheel', deltaY: -500, deltaX: 0, ...point })
  await sleep(200)
  check('History wheel scroll works', await evaluate("document.querySelector('.conversation-history').scrollTop") < beforeScroll.top)
  await evaluate('window.scrollTo(0, 500)')
  check('Body stays still with long history', await evaluate('window.scrollY'), 0)
  check('Composer remains fixed', await evaluate("document.querySelector('.message-form').getBoundingClientRect().y"), beforeScroll.inputY)
  check('Long history does not enlarge viewport', await evaluate('document.documentElement.scrollHeight <= innerHeight'))
  await screenshot('talk-scrolled')

  for (const path of ['/profile', '/activities', '/voice', '/goods']) {
    await navigate(path)
    check(`${path}: active navigation`, await evaluate("document.querySelector('.navigation a[aria-current=page]').getAttribute('href')"), path)
    check(`${path}: normal body scrolling`, await evaluate("getComputedStyle(document.body).overflowY !== 'hidden'"))
    check(`${path}: no horizontal overflow`, await evaluate('document.documentElement.scrollWidth <= innerWidth'))
    if (path === '/profile') check('Profile fields remain unspecified', await evaluate("Array.from(document.querySelectorAll('.profile-fields dd')).every(e => e.textContent === '未設定')"))
    if (path === '/activities') {
      check('Three clearly marked sample records', await evaluate("document.querySelectorAll('.activity-card').length === 3 && document.querySelector('.page-heading p').textContent.includes('実際の活動記録ではありません')"))
      await click('.activity-filters button:nth-child(3)')
      check('Activity filter works', await evaluate("document.querySelectorAll('.activity-card').length"), 1)
      await click('.activity-card .button-link')
      check('Sample detail opens', await evaluate("document.querySelector('dialog[open] p').textContent.includes('サンプル')"))
      await click('dialog[open] button')
      await click('.activity-filters button:first-child')
    }
    if (path === '/voice') check('Three disabled voice placeholders, no media', await evaluate("document.querySelectorAll('.voice-card').length === 3 && document.querySelectorAll('.voice-card button:disabled').length === 3 && document.querySelectorAll('audio,video').length === 0"))
    if (path === '/goods') check('Four goods placeholders and disabled external destinations', await evaluate("document.querySelectorAll('.goods-card').length === 4 && document.querySelectorAll('.goods-page button:disabled').length === 5 && document.querySelectorAll('.goods-page img,.goods-page a[href^=http]').length === 0"))
    await screenshot(path.slice(1))
    const previousTimeOrigin = await evaluate('performance.timeOrigin')
    await page('Page.reload', { ignoreCache: true })
    await until(`performance.timeOrigin !== ${previousTimeOrigin} && document.querySelector('.navigation a[aria-current=page]')?.getAttribute('href') === ${JSON.stringify(path)}`)
    check(`${path}: direct reload works`, await evaluate('location.pathname'), path)
  }
  await click('.back-to-talk a')
  check('Goods return link goes to Talk', await evaluate('location.pathname'), '/')
  await navigate('/profile')
  await viewport(1440, 600)
  await evaluate('window.scrollTo(0, 500)')
  check('Content pages can scroll vertically', await evaluate('window.scrollY > 0'))
  await evaluate('window.scrollTo(0, 0)')
  await navigate('/')
  check('Returning to Talk restores body lock', await evaluate("location.pathname === '/' && getComputedStyle(document.body).overflowY === 'hidden' && scrollY === 0"))
  await viewport(390, 844, true)
  for (const path of ['/', '/profile', '/activities', '/voice', '/goods']) {
    await navigate(path)
    check(`${path}: mobile width fits`, await evaluate('document.documentElement.scrollWidth <= innerWidth'))
    if (path === '/') {
      check('Mobile Talk fits height and exposes input', await evaluate("document.documentElement.scrollHeight <= innerHeight && document.querySelector('.message-form').getBoundingClientRect().bottom <= innerHeight"))
      check('Mobile send button stays on one line', await evaluate("document.querySelector('.message-form button').getBoundingClientRect().height <= 54"))
      await screenshot('talk-mobile')
    }
  }
  await navigate('/')
  for (const topic of ['About', 'Credits', 'Privacy']) {
    await click(`.site-footer a[href="#${topic.toLowerCase()}"]`)
    check(`${topic}: placeholder dialog`, await evaluate("document.querySelector('dialog[open] h2').textContent"), topic)
    await page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await until("document.querySelector('dialog[open]') === null")
  }
  check('No browser console errors', report.consoleErrors, [])
  check('No external HTTP or API requests', report.externalRequests, [])
  report.passed = true
} catch (error) {
  report.failure = error.message
  console.error(error)
  process.exitCode = 1
} finally {
  if (send && socket?.readyState === WebSocket.OPEN) {
    try { await send('Browser.close') } catch { /* The browser may close the connection first. */ }
  }
  socket?.close()
  if (browser.exitCode === null) {
    await Promise.race([new Promise((done) => browser.once('exit', done)), sleep(3000)])
    if (browser.exitCode === null) browser.kill()
  }
  for (const task of pending.values()) clearTimeout(task.timeout)
  report.browserStopped = browser.exitCode !== null || browser.killed
  await writeFile(resolve(outputDirectory, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Result: ${report.passed ? 'PASS' : 'FAIL'}; ${report.checks.length} checks; browser stopped: ${report.browserStopped}`)
}

/**
 * Dev-only verification harness: loads the running app in headless Chromium,
 * waits for load + shader compile + a few animation frames, captures a screenshot,
 * and reports any console/page/shader errors.
 *
 *   node tools/screenshot.mjs [outPath] [waitMs] [url]
 *
 * Not part of the app runtime. Requires the dev server to be running.
 */
import puppeteer from 'puppeteer'

const out = process.argv[2] || 'tools/_preview.png'
const waitMs = Number(process.argv[3] || 11000)
const url = process.argv[4] || 'http://localhost:5173/'

const logs = []
const errors = []

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader',
    '--window-size=1600,1000',
  ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
page.on('requestfailed', (r) => errors.push(`REQFAIL: ${r.url()} ${r.failure()?.errorText}`))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, waitMs))

await page.screenshot({ path: out })
await browser.close()

// Filter out the benign SwiftShader blit-framebuffer spam so real problems surface.
const noise = /glBlitFramebuffer|GPU stall|ReadPixels/i
const shaderErrs = logs.filter((l) => /shader|glsl|compile|THREE\.WebGLProgram/i.test(l) && !noise.test(l))
console.log('screenshot ->', out)
console.log('SHADER/PROGRAM ERRORS:', shaderErrs.length ? '\n' + shaderErrs.join('\n') : '(none) ✓')
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

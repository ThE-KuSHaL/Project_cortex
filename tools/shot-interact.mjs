/**
 * Dev-only: loads the app, clicks several points on the brain to select regions,
 * then screenshots the deployed panels + connectors. Reports console/page errors.
 *   node tools/shot-interact.mjs [outPath]
 */
import puppeteer from 'puppeteer'

const out = process.argv[2] || 'tools/_m3.png'
const url = 'http://localhost:5173/'
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

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000)) // load + shader compile + settle

// Click a spread of points across the brain mass to select a few regions.
const points = [
  [markX(0.53), markY(0.30)],
  [markX(0.45), markY(0.5)],
  [markX(0.6), markY(0.62)],
]
function markX(f) { return Math.round(1600 * f) }
function markY(f) { return Math.round(1000 * f) }

for (const [x, y] of points) {
  await page.mouse.move(x, y)
  await new Promise((r) => setTimeout(r, 250))
  await page.mouse.click(x, y)
  await new Promise((r) => setTimeout(r, 700))
}
await new Promise((r) => setTimeout(r, 1500)) // let panels deploy

const selCount = await page.evaluate(() => document.querySelectorAll('.panel').length)
await page.screenshot({ path: out })
await browser.close()

const noise = /glBlitFramebuffer|GPU stall|ReadPixels/i
const shaderErrs = logs.filter((l) => /shader|glsl|compile|THREE\.WebGLProgram/i.test(l) && !noise.test(l))
console.log('screenshot ->', out)
console.log('panels rendered:', selCount)
console.log('SHADER/PROGRAM ERRORS:', shaderErrs.length ? '\n' + shaderErrs.join('\n') : '(none) ✓')
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

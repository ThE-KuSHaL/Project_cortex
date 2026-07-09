/** Dev-only: selects all 7 regions via keyboard (ArrowRight+Enter x7) to reach the
 *  Synchronized state, then screenshots. node tools/shot-sync.mjs [outPath] */
import puppeteer from 'puppeteer'

const out = process.argv[2] || 'tools/_m4.png'
const url = 'http://localhost:5173/?perf'
const logs = []
const errors = []

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--window-size=1600,1000'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000))

// Cycle hovered region and toggle it selected, seven times.
for (let i = 0; i < 7; i++) {
  await page.keyboard.press('ArrowRight')
  await new Promise((r) => setTimeout(r, 120))
  await page.keyboard.press('Enter')
  await new Promise((r) => setTimeout(r, 260))
}
await new Promise((r) => setTimeout(r, 2500)) // sync crescendo ease

const panels = await page.evaluate(() => document.querySelectorAll('.panel').length)
const status = await page.evaluate(() => document.querySelector('.hud__status')?.textContent?.trim())
await page.screenshot({ path: out })
await browser.close()

const noise = /glBlitFramebuffer|GPU stall|ReadPixels/i
const shaderErrs = logs.filter((l) => /shader|glsl|compile|THREE\.WebGLProgram/i.test(l) && !noise.test(l))
console.log('screenshot ->', out)
console.log('panels:', panels, '| status:', status)
console.log('SHADER/PROGRAM ERRORS:', shaderErrs.length ? '\n' + shaderErrs.join('\n') : '(none) ✓')
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

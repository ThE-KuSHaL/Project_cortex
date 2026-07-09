/**
 * Art-direction capture harness (dev-only). Shoots the canonical states in one run so
 * shader/post/lighting constants can be judged by eye against assets/brain.png:
 *   1. dormant   — three-quarter framing (the reference camera)
 *   2. close     — zoomed in on the surface (reward-on-zoom / trace detail)
 *   3. sync      — all 7 regions active (Synchronized crescendo)
 *
 * Usage: node tools/artdir.mjs [tag]   ->  tools/_ad_<tag>_{dormant,close,sync}.png
 */
import puppeteer from 'puppeteer'

const tag = process.argv[2] || 'cur'
const base = `tools/_ad_${tag}`
const url = 'http://localhost:5173/'
const logs = []
const errors = []

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader',
    '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--window-size=1600,1000',
  ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000)) // model load + shader compile + settle

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const cx = 800, cy = 500

// --- 1. DORMANT (three-quarter, as loaded) ---
await sleep(600)
await page.screenshot({ path: `${base}_dormant.png` })

// --- 2. CLOSE (zoom toward the surface) ---
await page.mouse.move(cx, cy)
for (let i = 0; i < 11; i++) { await page.mouse.wheel({ deltaY: -120 }); await sleep(80) }
await sleep(1200)
await page.screenshot({ path: `${base}_close.png` })

// zoom back out
for (let i = 0; i < 11; i++) { await page.mouse.wheel({ deltaY: 120 }); await sleep(70) }
await sleep(800)

// --- 3. SYNC (activate all 7 via keyboard) ---
for (let i = 0; i < 7; i++) {
  await page.keyboard.press('ArrowRight'); await sleep(110)
  await page.keyboard.press('Enter'); await sleep(240)
}
await sleep(2600) // crescendo ease
const status = await page.evaluate(() => document.querySelector('.hud__status')?.textContent?.trim())
await page.screenshot({ path: `${base}_sync.png` })

await browser.close()
const noise = /glBlitFramebuffer|GPU stall|ReadPixels/i
const shaderErrs = logs.filter((l) => /shader|glsl|compile|THREE\.WebGLProgram/i.test(l) && !noise.test(l))
console.log(`captured -> ${base}_{dormant,close,sync}.png | sync status: ${status}`)
console.log('SHADER/PROGRAM ERRORS:', shaderErrs.length ? '\n' + shaderErrs.join('\n') : '(none) ✓')
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

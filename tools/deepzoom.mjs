import puppeteer from 'puppeteer'

// One-off deep-inspection capture: zoom to the minimum orbit distance and drag up so the
// surface fills the frame — verifies that the ~16k instanced components actually resolve.
const tag = process.argv[2] || 'deep'
const url = 'http://localhost:5173/'
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader',
    '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--window-size=1600,1000',
  ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const cx = 800, cy = 500

// Zoom all the way in.
await page.mouse.move(cx, cy)
for (let i = 0; i < 30; i++) { await page.mouse.wheel({ deltaY: -120 }); await sleep(50) }
await sleep(1000)
await page.screenshot({ path: `tools/_ad_${tag}_a.png` })

// Orbit slightly to a fresh patch of surface.
await page.mouse.move(cx, cy)
await page.mouse.down()
await page.mouse.move(cx - 220, cy + 60, { steps: 20 })
await page.mouse.up()
await sleep(900)
await page.screenshot({ path: `tools/_ad_${tag}_b.png` })

await browser.close()
console.log(`deep capture -> tools/_ad_${tag}_{a,b}.png | errors: ${errors.length ? errors.slice(0,3).join(' | ') : '(none) ✓'}`)

/** Dev-only: verifies the region navigator is hidden by default and revealed on Tab,
 *  and that a11y additions render without errors. node tools/shot-a11y.mjs */
import puppeteer from 'puppeteer'

const args = ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--window-size=1600,1000']
const errors = []
const browser = await puppeteer.launch({ headless: 'new', args })
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000))

// Is the region-nav visible before any focus? (should be clipped/opacity 0)
const navBefore = await page.evaluate(() => {
  const el = document.querySelector('.region-nav')
  if (!el) return { present: false }
  const cs = getComputedStyle(el)
  return { present: true, opacity: cs.opacity, clip: cs.clipPath }
})

// Tab a few times to move focus into the region navigator.
for (let i = 0; i < 2; i++) { await page.keyboard.press('Tab'); await new Promise((r) => setTimeout(r, 250)) }
await new Promise((r) => setTimeout(r, 600))

const navAfter = await page.evaluate(() => {
  const el = document.querySelector('.region-nav')
  const cs = el ? getComputedStyle(el) : null
  const active = document.activeElement
  return {
    opacity: cs?.opacity,
    focusInsideNav: !!(active && active.closest('.region-nav')),
    focusedLabel: active?.getAttribute('aria-label') || active?.className,
    srOnlyPresent: !!document.querySelector('.sr-only[aria-live]'),
  }
})
await page.screenshot({ path: 'tools/_a11y.png' })
await browser.close()

console.log('nav before focus:', JSON.stringify(navBefore))
console.log('nav after Tab   :', JSON.stringify(navAfter))
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

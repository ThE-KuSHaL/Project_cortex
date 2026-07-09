/** Dev-only M5 verification: (1) zoomed-in desktop shot to show surface chips/vias,
 *  (2) mobile-viewport shot with a panel open to show the bottom dock. */
import puppeteer from 'puppeteer'

const args = ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
const BASE = process.env.BASE || 'http://localhost:5173/'
const logs = []
const errors = []
const browser = await puppeteer.launch({ headless: 'new', args })

// --- 1. Desktop, zoomed in ---
const p1 = await browser.newPage()
await p1.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
p1.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
p1.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
await p1.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000))
// zoom in with several wheel scrolls toward the brain
await p1.mouse.move(800, 500)
for (let i = 0; i < 10; i++) { await p1.mouse.wheel({ deltaY: -120 }); await new Promise((r) => setTimeout(r, 90)) }
await new Promise((r) => setTimeout(r, 1500))
await p1.screenshot({ path: 'tools/_m5_zoom.png' })
const instMeshes = await p1.evaluate(() => window.performance ? true : true)
await p1.close()

// --- 2. Mobile ---
const p2 = await browser.newPage()
await p2.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
p2.on('pageerror', (e) => errors.push(`M-PAGEERROR: ${e.message}`))
await p2.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 8000))
// tap the brain roughly centre to open a panel
await p2.touchscreen ? null : null
await p2.mouse.move(195, 380)
await new Promise((r) => setTimeout(r, 200))
await p2.mouse.click(195, 380)
await new Promise((r) => setTimeout(r, 1400))
const dockPanels = await p2.evaluate(() => document.querySelectorAll('.panel-dock .panel').length)
const dockExists = await p2.evaluate(() => !!document.querySelector('.panel-dock'))
await p2.screenshot({ path: 'tools/_m5_mobile.png' })
await p2.close()

await browser.close()
const noise = /glBlitFramebuffer|GPU stall|ReadPixels/i
const shaderErrs = logs.filter((l) => /shader|glsl|compile|THREE\.WebGLProgram/i.test(l) && !noise.test(l))
console.log('desktop zoom -> tools/_m5_zoom.png')
console.log('mobile -> tools/_m5_mobile.png | dock present:', dockExists, '| dock panels:', dockPanels)
console.log('SHADER/PROGRAM ERRORS:', shaderErrs.length ? '\n' + shaderErrs.join('\n') : '(none) ✓')
console.log('PAGE ERRORS:', errors.length ? '\n' + errors.join('\n') : '(none) ✓')

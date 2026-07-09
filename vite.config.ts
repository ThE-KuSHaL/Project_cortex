import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Cortex — dev/build config.
// GLSL is kept inline (template strings) so no extra glsl plugin is required.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true, host: true },
  build: {
    target: 'es2020',
    sourcemap: false, // don't ship the multi-MB source map to visitors
    chunkSizeWarningLimit: 900, // three.js is intentionally its own cacheable vendor chunk
    rollupOptions: {
      output: {
        // Split heavy vendors so first load parallelizes and vendor code caches
        // across app updates (docs/12 fast initial load).
        // Acyclic split. `three` = three CORE only (dependency-free leaf). `react` =
        // react/react-dom/scheduler (leaf). `render` = three-stdlib + bvh + @react-three/* +
        // postprocessing + zustand, depending only on `three` and `react`. App code stays a
        // tiny entry chunk and updates independently while heavy vendors cache across releases.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react'
          if (id.includes('/three/')) return 'three'
          return 'render'
        },
      },
    },
  },
  assetsInclude: ['**/*.glb', '**/*.hdr'],
})

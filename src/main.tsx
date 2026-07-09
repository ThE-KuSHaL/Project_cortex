import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

const container = document.getElementById('root')
if (!container) throw new Error('Project Cortex: #root not found')

/** Preflight: WebGL2 is required. Fail with a calm message rather than a blank canvas. */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

const root = createRoot(container)

if (!hasWebGL2()) {
  root.render(
    <div className="fatal" role="alert">
      <div className="fatal__inner">
        <h2 className="fatal__title">WebGL2 is required</h2>
        <p className="fatal__msg">
          Project Cortex needs a WebGL2-capable browser and GPU. Please try a recent
          version of Chrome, Edge, Firefox or Safari with hardware acceleration enabled.
        </p>
      </div>
    </div>,
  )
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

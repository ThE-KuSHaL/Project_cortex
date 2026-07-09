import { Component, type ReactNode } from 'react'

/**
 * Graceful failure (docs/13 error handling): a failed GLB load or shader compile
 * surfaces a calm message instead of a blank screen or a crashed page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[Project Cortex] fatal error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal" role="alert">
          <div className="fatal__inner">
            <h2 className="fatal__title">Cortex could not initialize</h2>
            <p className="fatal__msg">
              The rendering system failed to start. This usually means WebGL is unavailable
              or the brain model could not be loaded.
            </p>
            <button className="fatal__retry" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

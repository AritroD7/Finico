// FILE: client/src/components/ErrorBoundary.jsx
import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null, info: null } }
  componentDidCatch(error, info) {
    console.error('❌ Render error:', error)
    console.error('🧭 Component stack:\n', info?.componentStack || '(no stack)')
    this.setState({ error, info })
  }
  render() {
    if (this.state.error) {
      return (
        <div className="container-page">
          <div className="card">
            <div className="text-lg font-semibold mb-2">UI error</div>
            <pre className="text-xs whitespace-pre-wrap text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            {this.state.info?.componentStack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Component stack</summary>
                <pre className="text-[11px] whitespace-pre-wrap text-slate-700 mt-1">
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import { ErrorFallback } from './ErrorFallback'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// Red de contención de errores de render. Captura excepciones del subárbol
// (incluidas fallas al cargar un chunk lazy) y muestra el `ErrorFallback` en
// lugar de tumbar toda la app. El `onRetry` reintenta el render en el lugar; a
// nivel de layout, además se remonta por ruta (ver `key` en AppLayout).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}

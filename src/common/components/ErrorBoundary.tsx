import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  error?: Error
  errorInfo?: React.ErrorInfo
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {};

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo });
  }

  public render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div style={{margin: 20}}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo!.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

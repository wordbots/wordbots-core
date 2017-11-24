import React, { Component } from 'react';
import { arrayOf, element, oneOfType } from 'prop-types';

export default class ErrorBoundary extends Component {
  static propTypes = {
    children: oneOfType([element, arrayOf(element)])
  }

  state = {
    error: null,
    errorInfo: null
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{margin: 20}}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

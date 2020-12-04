import * as React from 'react';

export default function asyncComponent<P>(importComponent: () => Promise<any>): React.ComponentType<P> {
  interface State {
    component?: React.ComponentType<P>
  }

  class AsyncComponent extends React.Component<P, State> {
    public state: State = {};

    public async UNSAFE_componentWillMount(): Promise<void> {
      const { default: component } = await importComponent() as { default: React.ComponentType<P> };

      this.setState({ component });
    }

    public render(): React.ReactNode {
      const C: React.ComponentType<P> | undefined = this.state.component;

      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}

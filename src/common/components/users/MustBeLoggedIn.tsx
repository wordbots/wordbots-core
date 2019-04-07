import { pick } from 'lodash';
import * as React from 'react';

import Tooltip from '../Tooltip';

interface MustBeLoggedInProps {
  loggedIn: boolean
  style?: React.CSSProperties
  children: JSX.Element | Array<JSX.Element | null>
}

export default class MustBeLoggedIn extends React.Component<MustBeLoggedInProps> {
  public render(): JSX.Element {
    if (this.props.loggedIn) {
      return (
        <div style={this.props.style}>
          {this.props.children}
        </div>
      );
    } else {
      return (
        <div className="notAllowed" style={this.props.style}>
          {React.Children.map(this.props.children, this.renderDisabledChild)}
        </div>
      );
    }
  }

  private renderDisabledChild(child: React.ReactChild | null): React.ReactNode {
    if (!child || typeof child !== 'object') {
      return child;
    }

    const propagatedStyleKeys = ['float', 'width', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'];

    const childStyle = child.props.style || {};
    const parentStyle = pick(childStyle, propagatedStyleKeys);
    const disabledChildstyle = {
      ...childStyle,
      float: 'none',
      width: childStyle.width ? '100%' : null,
      margin: 0
    };

    return (
      <Tooltip text="You must be logged in to perform this action.">
        <div style={parentStyle}>
          {React.cloneElement(child, { disabled: true, style: disabledChildstyle })}
        </div>
      </Tooltip>
    );
  }
}

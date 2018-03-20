import React, { Component } from 'react';
import { arrayOf, bool, object, oneOfType } from 'prop-types';
import { pick } from 'lodash';

import Tooltip from '../Tooltip';

export default class MustBeLoggedIn extends Component {
  static propTypes = {
    loggedIn: bool,
    children: oneOfType([arrayOf(object), object]),
    style: object
  };

  static defaultProps = {
    style: {}
  };

  renderDisabledChild(child) {
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

  render() {
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
}

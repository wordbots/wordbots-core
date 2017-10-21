import React, { Component } from 'react';
import { arrayOf, bool, object, oneOfType } from 'prop-types';
import { pick } from 'lodash';

import Tooltip from '../Tooltip';

export default class MustBeLoggedIn extends Component {
  static propTypes = {
    loggedIn: bool,
    children: oneOfType([arrayOf(object), object])
  };

  renderDisabledChild(child) {
    const propagatedStyleKeys = ['float', 'width', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'];

    const parentStyle = pick(child.props.style, propagatedStyleKeys);
    const childStyle = {
      ...child.props.style,
      float: 'none',
      width: child.props.style.width ? '100%' : null,
      margin: 0
    };

    return (
      <Tooltip text="You must be logged in to perform this action.">
        <div style={parentStyle}>
          {React.cloneElement(child, { disabled: true, style: childStyle })}
        </div>
      </Tooltip>
    );
  }

  render() {
    if (this.props.loggedIn) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    } else {
      return (
        <div className="notAllowed">
          {React.Children.map(this.props.children, this.renderDisabledChild)}
        </div>
      );
    }
  }
}

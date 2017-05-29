import React, { Component } from 'react';
import { array, bool, element, object, oneOfType, string } from 'prop-types';
import { Route } from 'react-router';
import Dialog from 'material-ui/Dialog';

import { transformHistory } from '../util/common';

export default class RouterDialog extends Component {
  static propTypes = {
    path: string,
    title: string,
    style: object,
    actions: array,
    modal: bool,
    scroll: bool,
    history: object,

    children: oneOfType([array, element])
  }

  static defaultProps = {
    style: {},
    actions: [],
    modal: false,
    scroll: false
  }

  static openDialog(history, dialogPath) {
    transformHistory(history, path => `${path.replace(/\/\/\w*/, '')}//${dialogPath}`);
  }

  static closeDialog(history) {
    transformHistory(history, path => path.replace(/\/\/\w*/, ''));
  }

  render() {
    return (
      <Route path={`*//${this.props.path}`} render={() => (
        <Dialog
          open
          modal={this.props.modal}
          autoScrollBodyContent={this.props.scroll}
          title={this.props.title}
          contentStyle={this.props.style}
          onRequestClose={() => { RouterDialog.closeDialog(this.props.history); }}
          actions={this.props.actions}
        >
          {this.props.children}
        </Dialog>
      )} />
    );
  }
}

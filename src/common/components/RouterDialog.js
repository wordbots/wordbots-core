import * as React from 'react';
import { arrayOf, bool, element, object, oneOfType, string } from 'prop-types';
import { Route } from 'react-router';
import Dialog from 'material-ui/Dialog';

import { transformHistory } from '../util/browser';

export default class RouterDialog extends React.Component {
  static propTypes = {
    path: string,
    title: string,
    style: object,
    bodyStyle: object,
    actions: arrayOf(element),
    modal: bool,
    scroll: bool,
    history: object,

    children: oneOfType([arrayOf(element), element])
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

  handleCloseDialog = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  renderDialog = () => (
    <Dialog
      open
      repositionOnUpdate={false}
      modal={this.props.modal}
      bodyStyle={Object.assign({ zIndex: 970 }, this.props.bodyStyle)}
      style={{ zIndex: 960 }}
      autoScrollBodyContent={this.props.scroll}
      title={this.props.title}
      contentStyle={this.props.style}
      actions={this.props.actions}
      onRequestClose={this.handleCloseDialog}
      overlayStyle={{ zIndex: 950 }}
    >
      {this.props.children}
    </Dialog>
  )

  render() {
    if (this.props.history) {
      return <Route path={`*//${this.props.path}`} render={this.renderDialog} />;
    } else {
      return null;
    }
  }
}

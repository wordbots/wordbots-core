import * as React from 'react';
import { arrayOf, bool, node, object, oneOfType, string } from 'prop-types';
import { Route } from 'react-router';
import Dialog from 'material-ui/Dialog';

import { DIALOG_OVERLAY_Z_INDEX, DIALOG_MAIN_Z_INDEX, DIALOG_BODY_Z_INDEX } from '../constants.ts';
import { transformHistory } from '../util/browser.tsx';

export default class RouterDialog extends React.Component {
  static propTypes = {
    path: string,
    title: string,
    style: object,
    bodyStyle: object,
    actions: arrayOf(node),
    modal: bool,
    scroll: bool,
    history: object,

    children: oneOfType([arrayOf(node), node])
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
      bodyStyle={Object.assign({ zIndex: DIALOG_BODY_Z_INDEX }, this.props.bodyStyle)}
      style={{ zIndex: DIALOG_MAIN_Z_INDEX }}
      autoScrollBodyContent={this.props.scroll}
      title={this.props.title}
      contentStyle={this.props.style}
      actions={this.props.actions}
      onRequestClose={this.handleCloseDialog}
      overlayStyle={{ zIndex: DIALOG_OVERLAY_Z_INDEX }}
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

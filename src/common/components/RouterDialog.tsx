import { History } from 'history';
import Dialog from 'material-ui/Dialog';
import * as React from 'react';
import { Route } from 'react-router';

import { DIALOG_BODY_Z_INDEX, DIALOG_MAIN_Z_INDEX, DIALOG_OVERLAY_Z_INDEX } from '../constants';
import { transformHistory } from '../util/browser';

interface RouterDialogProps {
  path: string
  title?: string
  children: React.ReactNode
  history: History
  bodyStyle?: React.CSSProperties
  style?: React.CSSProperties
  actions?: JSX.Element[]
  modal?: boolean
  scroll?: boolean
}

export default class RouterDialog extends React.Component<RouterDialogProps> {
  public static openDialog(history: History, dialogPath: string): void {
    transformHistory(history, (path) => `${path.replace(/\/\/[^\/]*/, '')}//${dialogPath}`);
  }

  public static closeDialog(history: History): void {
    transformHistory(history, (path) => path.replace(/\/\/[^\/]*/, ''));
  }

  public render(): JSX.Element | null {
    if (this.props.history) {
      return <Route path={`*//${this.props.path}`} render={this.renderDialog} />;
    } else {
      return null;
    }
  }

  private handleCloseDialog = () => {
    RouterDialog.closeDialog(this.props.history);
  }

  private renderDialog = () => (
    <Dialog
      open
      repositionOnUpdate={false}
      modal={this.props.modal || false}
      bodyStyle={Object.assign({ zIndex: DIALOG_BODY_Z_INDEX }, this.props.bodyStyle || {})}
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
}

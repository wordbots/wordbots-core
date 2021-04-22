import { DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import { History } from 'history';
import * as React from 'react';
import { Route } from 'react-router';

import { DIALOG_Z_INDEX } from '../constants';
import { transformHistory } from '../util/browser';

interface RouterDialogProps {
  path: string
  title?: string
  children: React.ReactNode
  history: History
  style: React.CSSProperties
  actions?: JSX.Element[]
  contentStyle?: React.CSSProperties
  actionsStyle?: React.CSSProperties
}

export default class RouterDialog extends React.Component<RouterDialogProps> {
  public static openDialog(history: History, dialogPath: string): void {
    transformHistory(history, (path) => `${path.replace(/\/\/[^/]*/, '')}//${dialogPath}`);
  }

  public static closeDialog(history: History): void {
    transformHistory(history, (path) => path.replace(/\/\/[^/]*/, ''));
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

  private renderDialog = () => {
    const { actions, actionsStyle, children, contentStyle, style, title } = this.props;
    return (
      <Dialog
        open
        PaperProps={{
          style: {
            zIndex: DIALOG_Z_INDEX,
            width: 'auto',
            maxWidth: 'none',
            maxHeight: 'calc(100% - 120px)',
            ...style
          }
        }}
        onClose={this.handleCloseDialog}
      >
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent style={contentStyle}>{children}</DialogContent>
        {actions && <DialogActions style={actionsStyle}>{actions}</DialogActions>}
      </Dialog>
    );
  }
}

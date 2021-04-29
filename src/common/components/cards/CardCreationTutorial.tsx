import { Dialog, DialogContent, DialogTitle, Icon, IconButton } from '@material-ui/core';
import * as React from 'react';
import IFrame from 'react-iframe';

import { isFlagSet, toggleFlag } from '../../util/browser';

interface CardCreationTutorialState {
  visible: boolean
}

export default class CardCreationTutorial extends React.Component<Record<string, never>, CardCreationTutorialState> {
  public state = {
    visible: !isFlagSet('skipCardCreationTutorial')
  };

  public render(): React.ReactNode {
    const { visible } = this.state;

    if (visible) {
      return (
        <Dialog
          open
          onClose={this.handleClose}
          PaperProps={{
            style: {
              width: 650,
              maxWidth: 650,
              height: 500
            }
          }}
        >
          <DialogTitle style={{ position: 'relative' }}>
            First time at the workshop?
            <IconButton
              onClick={this.handleClose}
              style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, margin: 10, padding: 0 }}
            >
              <Icon>close</Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ overflowY: 'hidden' }}>
            <div>This video tutorial explains how to create cards in the workshop.</div>
            <div><em>(You can re-watch it at any time by clicking the Help button at the top of the page.)</em></div>

            <div style={{ margin: 'auto', width: 622, height: 350, padding: 20, boxSizing: 'border-box' }}>
              <IFrame
                position="relative"
                url="https://www.youtube.com/embed/GeZwKIOKc1c?rel=0"
                width="100%"
                height="100%"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    } else {
      return null;
    }
  }

  private handleClose = (): void => {
    toggleFlag('skipCardCreationTutorial');
    this.setState({ visible: false });
  }
}

import { Icon, IconButton, Paper } from '@material-ui/core';
import * as React from 'react';
import IFrame from 'react-iframe';

import { isFlagSet, toggleFlag } from '../../util/browser';

interface CardCreationTutorialState {
  visible: boolean;
}

export default class CardCreationTutorial extends React.Component<Record<string, never>, CardCreationTutorialState> {
  public state = {
    visible: !isFlagSet('skipCardCreationTutorial')
  };

  public render(): React.ReactNode {
    const { visible } = this.state;

    if (visible) {
      return (
        <Paper
          style={{
            maxWidth: 860,
            height: 550,
            margin: '0 auto 15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <Paper
              style={{
                fontSize: 18,
                backgroundColor: '#f3645e',
                color: 'white',
                fontFamily: 'Carter One',
                padding: '10px 15px',
                borderBottomRightRadius: 5
              }}
            >
              First time here? Watch this tutorial!
            </Paper>
            <IconButton onClick={this.handleClose} style={{ width: 24, height: 24, margin: 10, padding: 0 }}>
              <Icon>close</Icon>
            </IconButton>
          </div>
          <div style={{ margin: 10, width: '100%', height: '100%', padding: 20, boxSizing: 'border-box' }}>
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
        </Paper>
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

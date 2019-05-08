import * as React from 'react';

import { BACKGROUND_Z_INDEX } from '../../constants';

interface FullscreenMessageProps {
  message: string
  height: number
  background: string
}

export default class FullscreenMessage extends React.Component<FullscreenMessageProps> {
  public render(): JSX.Element {
    const { message, height, background } = this.props;
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height,
          zIndex: BACKGROUND_Z_INDEX,
          background: `url(${background})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Carter One',
          fontSize: 32,
          color: 'white'
        }}
      >
        {message}
      </div>
    );
  }
}

import * as React from 'react';

import { BACKGROUND_Z_INDEX } from '../../constants';

interface FullscreenMessageProps {
  message: string
  height: number
}

export default class FullscreenMessage extends React.PureComponent<FullscreenMessageProps> {
  public render(): JSX.Element {
    const { message, height } = this.props;
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height,
          zIndex: BACKGROUND_Z_INDEX,
          background: `url(/static/black_bg_lodyas.png)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Carter One", "Carter One-fallback"',
          fontSize: 32,
          color: 'white'
        }}
      >
        {message}
      </div>
    );
  }
}

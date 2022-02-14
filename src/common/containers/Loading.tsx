import * as React from 'react';

import Background from '../components/Background';
import SpinningGears from '../components/SpinningGears';
import { HEADER_HEIGHT } from '../constants';

export default class Loading extends React.PureComponent {
  public render(): JSX.Element {
    return (
      <div>
        <Background asset="compressed/433145.jpg" opacity={0.08} style={{ top: 0 }} />
        <div
          style={{
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <SpinningGears />
        </div>
      </div>
    );
  }
}

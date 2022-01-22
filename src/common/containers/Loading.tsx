import * as React from 'react';

import Background from '../components/Background';
import SpinningGears from '../components/SpinningGears';

export default class Loading extends React.PureComponent {
  public render(): JSX.Element {
    return (
      <div>
        <Background asset="compressed/433145.jpg" opacity={0.08} style={{ top: 0 }} />
        <div
          style={{
            margin: '100px auto',
            textAlign: 'center',
            fontFamily: 'Carter One',
            fontSize: '2em',
            color: '#999'
          }}
        >
          <SpinningGears />
        </div>
      </div>
    );
  }
}

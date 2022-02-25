import { red } from '@material-ui/core/colors';
import * as React from 'react';

import { MAX_Z_INDEX } from '../../constants';
import SpinningGears from '../SpinningGears';

interface ParsingIndicatorProps {
  isWaitingForParse: boolean
}

export default class ParsingIndicator extends React.PureComponent<ParsingIndicatorProps> {
  public render(): JSX.Element | null {
    return this.props.isWaitingForParse
      ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: MAX_Z_INDEX,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '40%',
            width: '100%',
            margin: 'auto',
            textAlign: 'center',
            fontFamily: 'Carter One',
            fontSize: '400%',
            color: red[500],
            WebkitTextStroke: '1px white'
          }}>
            Parsing ...
          </div>
          <SpinningGears />
      </div>
      )
      : null;
  }
}

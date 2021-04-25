import { times } from 'lodash';
import * as React from 'react';

const GEAR_PAIR_WIDTH = 41;

interface ConveyorBeltProps {
  width: number
  paused?: boolean
}


// Based on https://codepen.io/adgllorente/pen/eZpPwm
// (CSS is in lib.css)
// eslint-disable-next-line react/prefer-stateless-function
export default class ConveyorBelt extends React.Component<ConveyorBeltProps> {
  public render(): JSX.Element {
    const { width, paused } = this.props;
    const numGearPairs = Math.ceil(width / GEAR_PAIR_WIDTH);

    return (
      <div
        className={`${paused ? 'paused' : ''}`}
        style={{
          display: 'inline-block',
          height: 20,
          border: '1px solid rgb(244, 67, 54)',
          borderRadius: 10,
          paddingRight: 3
        }}
      >
        {times(numGearPairs, (i: number) => {
          const last = i === numGearPairs - 1;
          return (
            <React.Fragment>
              <span key={`${i}.1`} className={`gear reverse ${last ? 'last' : ''}`}>
                <span className="body" />
                <span className="tooth" />
                <span className="tooth rotate-45" />
                <span className="tooth rotate-90" />
                <span className="tooth rotate-135" />
                <span className="hole" />
              </span>
              {
                !last &&
                  <span key={`${i}.2`} className="gear forward">
                    <span className="body" />
                    <span className="tooth" />
                    <span className="tooth rotate-45" />
                    <span className="tooth rotate-90" />
                    <span className="tooth rotate-135" />
                    <span className="hole" />
                  </span>
              }
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

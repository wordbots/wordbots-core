import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Pulse } from 'better-react-spinkit';
import * as moment from 'moment';
import * as React from 'react';

interface WaitingProps {
  inQueue: boolean
  queueFormatName: string
  queueSize: number
  onLeaveQueue: () => void
}

interface WaitingState {
  waitingSecs: number
}

export default class Waiting extends React.Component<WaitingProps, WaitingState> {
  public state = {
    waitingSecs: 0
  };

  public componentDidMount(): void {
    // https://github.com/moment/momentjs.com/blob/master/docs/moment/07-customization/13-relative-time-threshold.md
    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('ss', 3);

    setTimeout(this.tick, 1000);
  }

  public render(): JSX.Element {
    const { inQueue, queueFormatName, queueSize, onLeaveQueue } = this.props;
    return (
      <Paper
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 20,
          marginBottom: 20
        }}
      >
        <Pulse style={{ marginRight: 15 }} />
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div>
              Waiting for an opponent
              {inQueue && ` in the '${queueFormatName}' queue`}
              <em>
                {' '}(waiting for {moment.duration(this.state.waitingSecs, 'seconds').humanize()}){' '}
              </em>
              ...
            </div>
          </div>
          { inQueue &&
            <div>
              {queueSize} player(s) in queue.{' '}
              <Button
                variant="outlined"
                color="secondary"
                onClick={onLeaveQueue}
              >
                Leave Queue
              </Button>
            </div>
          }
        </div>
      </Paper>
    );
  }

  private tick = () => {
    this.setState((state) => ({ waitingSecs: state.waitingSecs + 1 }));
    setTimeout(this.tick, 1000);
  }
}

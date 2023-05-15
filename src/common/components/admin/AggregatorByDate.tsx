import { countBy, orderBy } from 'lodash';
import * as moment from 'moment';
import * as React from 'react';

interface AggregatorByDateProps {
  label: string
  timestamps: Array<number | undefined>
}

interface AggregatorByDateState {
  granularity: 'month' | 'day' | 'year'
}

class AggregatorByDate extends React.Component<AggregatorByDateProps, AggregatorByDateState> {
  state: AggregatorByDateState = {
    granularity: 'month'
  }

  public render(): JSX.Element {
    const { label, timestamps } = this.props;
    const { granularity } = this.state;
    const counts = countBy(timestamps, (timestamp) => (
      timestamp
        ? ({
          month: moment(timestamp).format('M/*/YYYY'),
          day: moment(timestamp).format('M/DD/YYYY'),
          year: moment(timestamp).format('*/*/YYYY'),
        })[granularity]
        : undefined
    ));

    return (
      <div>
        <h4>{label} by <a className="underline" onClick={this.toggleGranularity}>{granularity}</a></h4>
        <ul>
          {orderBy(
            Object.entries(counts),
            (([agg]) => agg !== 'undefined' ? `${moment(agg.replace(/\*/g, '1')).valueOf()}` : 0),
            'desc'
          )
            .map(([agg, count]) => (
              <li key={agg}><b>{agg !== 'undefined' ? agg.replace(/\*\//g, '') : '(unknown)'}</b>: {count}</li>
            ))}
        </ul>
      </div>
    );
  }

  private toggleGranularity = (): void => {
    this.setState((state) => ({
      granularity: ({
        'month': 'day',
        'day': 'year',
        'year': 'month'
      })[state.granularity] as AggregatorByDateState['granularity']
    }));
  }
}

export default AggregatorByDate;

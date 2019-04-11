import { times } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import asyncComponent from '../AsyncComponent';

const BarChart = asyncComponent(() => import(/* webpackChunkName: 'react-bar-chart' */ 'react-bar-chart'));

interface EnergyCurveProps {
  cards: w.CardInStore[]
  height?: number
}

interface EnergyCurveState {
  width: number
}

// Widget to display the current energy curve for a set of cards
export default class EnergyCurve extends React.Component<EnergyCurveProps, EnergyCurveState> {
  public static defaultProps = {
    height: 130
  };

  public state = {
    width: 200
  };

  public componentDidMount(): void {
    this.updateWidth();

    window.addEventListener('resize', () => {
      this.updateWidth();
    });
  }

  get data(): Array<{ text: string, value: number }> {
    const curve: Record<string, number> = {};

    this.props.cards.forEach((card) => {
      if (card.cost > 10) {
        curve[10] ? curve[10] += 1 : curve[10] = 1;
      } else {
        curve[card.cost] ? curve[card.cost] += 1 : curve[card.cost] = 1;
      }
    });

    const data: Array<{ text: string, value: number }> = [];

    times(10, (i) => {
      data.push({
        text: i.toString(),
        value: curve[i] || 0
      });
    });

    data.push({
      text: '10+',
      value: curve[10] || 0
    });

    return data;
  }

  public render(): JSX.Element {
    const margins = {
      top: 15,
      right: 10,
      bottom: 20,
      left: 10
    };

    return (
      <div ref={(node) => { (this as any).node = node; }}>
        <BarChart
          width={this.state.width}
          height={this.props.height}
          margin={margins}
          data={this.data}
        />
      </div>
    );
  }

  private updateWidth(): void {
    if ((this as any).node) {
      this.setState({
        width: (this as any).node.offsetWidth
      });
    }
  }
}

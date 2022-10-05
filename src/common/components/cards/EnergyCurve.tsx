import { max, times } from 'lodash';
import * as React from 'react';

import * as w from '../../types';

interface EnergyCurveProps {
  cards: w.CardInStore[]
  height: number
}

interface EnergyCurveState {
  width: number
}

const AXIS_HEIGHT = 35;

// Widget to display the current energy curve for a set of cards
export default class EnergyCurve extends React.Component<EnergyCurveProps, EnergyCurveState> {
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

  get maxValue(): number {
    return max(this.data.map(d => d.value)) || 0;
  }

  private valueToHeight(value: number): number {
    return (value / this.maxValue) * (this.props.height - AXIS_HEIGHT);
  }

  public render(): JSX.Element {
    const { height } = this.props;
    const { width } = this.state;
    const elemWidth = Math.ceil(width / this.data.length) - 2;

    // The below is based roughly on react-bar-chart's implementation (which in turn relies on D3):
    return (
      <div ref={(node) => { (this as any).node = node; }}>
        <svg width={width} height={height}>
          <g className="graph" transform="translate(10, 15)">
            <g className="x axis" transform={`translate(0, ${height - AXIS_HEIGHT})`}>
              {this.data.map(({ text }, i) => (
                <g key={i} className="tick" transform={`translate(${(i + 0.5) * elemWidth - 1},0)`}>
                  <line y2="6" x2="0" />
                  <text dy=".71em" y="9" x="0" style={{ textAnchor: 'middle', font: '10px sans-serif' }}>{text}</text>
                </g>
              ))}
            </g>
            {this.data.map(({ value }, i) => (
              <rect
                key={i}
                className="bar"
                x={i * elemWidth + 2}
                width={Math.floor(elemWidth * .9)}
                y={height - AXIS_HEIGHT - this.valueToHeight(value)}
                height={this.valueToHeight(value)}
                style={{ fill: '#64B5F6' }}
              />
            ))}
          </g>
        </svg>
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

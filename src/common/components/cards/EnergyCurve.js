import React, {Component} from 'react';
import {array, number} from 'prop-types';
import BarChart from 'react-bar-chart';
import {times} from 'lodash';

// Widget to display the current energy curve for a set of cards
export default class EnergyCurve extends Component {
  static propTypes = {
    cards: array,
    height: number
  };

  static defaultProps = {
    height: 130
  };

  constructor(props) {
    super(props);

    this.state = {
      width: 200
    };
  }

  componentDidMount() {
    this.updateWidth();

    window.onresize = () => {
      this.updateWidth();
    };
  }

  updateWidth() {
    this.setState({
      width: this.node.offsetWidth
    });
  }

  parseCards(cards) {
    const curve = {};

    cards.forEach(card => {
      if (card.cost > 10) curve[10] ? (curve[10] += 1) : (curve[10] = 1);
      else curve[card.cost] ? (curve[card.cost] += 1) : (curve[card.cost] = 1);
    });

    const data = [];

    times(10, i => {
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

  render() {
    const margins = {
      top: 15,
      right: 10,
      bottom: 20,
      left: 10
    };

    return (
      <div
        ref={node => {
          this.node = node;
        }}
      >
        <BarChart
          width={this.state.width}
          height={this.props.height}
          margin={margins}
          data={this.parseCards(this.props.cards)}
        />
      </div>
    );
  }
}

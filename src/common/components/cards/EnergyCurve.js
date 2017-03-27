import React, { Component } from 'react';
import BarChart from 'react-bar-chart';

// Widget to display the current energy curve for a set of cards
class EnergyCurve extends Component {
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
      width: this.refs.root.offsetWidth
    });
  }

  parseCards(cards) {
    const curve = {};

    cards.forEach(card => {
      if (card.cost > 10)
        curve[10] ? curve[10] += 1 : curve[10] = 1;
      else 
        curve[card.cost] ? curve[card.cost] += 1 : curve[card.cost] = 1;
    });

    const data = [];

    for (let i = 0; i < 10; i++) {
      data.push({
        text: i.toString(),
        value: curve[i] || 0
      });
    }

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
      <div ref="root">
        <div style={{
          fontWeight: 100,
          fontSize: 28
        }}>Energy Curve</div>

        <BarChart
          width={this.state.width}
          height={130}
          margin={margins}
          data={this.parseCards(this.props.cards)} />
      </div>
    );
  }
}

const { array } = React.PropTypes;

EnergyCurve.propTypes = {
  cards: array
};

export default EnergyCurve;

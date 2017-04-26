import React, { Component } from 'react';
import { number, func } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

export default class CardGrid extends Component {
  static propTypes = {
    page: number,
    maxPages: number,
    prevPage: func,
    nextPage: func
  };

  render() {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: 20
      }}>
        <RaisedButton
          icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
          disabled={this.props.page <= 1}
          onClick={() => this.props.prevPage()}
        />
        <div>{`${this.props.page} / ${this.props.maxPages}`}</div>
        <RaisedButton
          icon={<FontIcon className="material-icons">arrow_forward</FontIcon>}
          disabled={this.props.page >= this.props.maxPages}
          onClick={() => this.props.nextPage()}
        />
      </div>
    );
  }
}

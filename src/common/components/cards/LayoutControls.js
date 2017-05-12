import React, { Component } from 'react';
import { func, number } from 'prop-types';
import FontIcon from 'material-ui/FontIcon';

export default class LayoutControls extends Component {
  static propTypes = {
    layout: number,
    onSetLayout: func
  };

  shouldComponentUpdate(newProps) {
    return (newProps.layout !== this.props.layout);
  }

  render() {
    const iconStyle = {
      fontSize: 36,
      padding: 10,
      borderRadius: 3,
      boxShadow: '1px 1px 3px #CCC',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'center',
      marginRight: 10
    };

    return (
      <div>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 20
        }}>Layout</div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: 20
        }}>
          <FontIcon
            className="material-icons"
            style={{
              color: this.props.layout === 0 ? 'white' : 'black',
              backgroundColor: this.props.layout === 0 ? '#F44336' : '#EEEEEE',
              ...iconStyle
            }}
            onClick={() => { this.props.onSetLayout(0); }}
          >
            view_module
          </FontIcon>
          <FontIcon
            className="material-icons"
            style={{
              color: this.props.layout === 1 ? 'white' : 'black',
              backgroundColor: this.props.layout === 1 ? '#F44336' : '#EEEEEE',
              ...iconStyle
            }}
            onClick={() => { this.props.onSetLayout(1); }}
          >
            view_list
          </FontIcon>
        </div>
      </div>
    );
  }
}

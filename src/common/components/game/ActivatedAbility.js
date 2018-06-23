import * as React from 'react';
import { func, number, string } from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';

export default class ActivatedAbility extends React.Component {
  static propTypes = {
    idx: number,
    marginBottom: number,
    text: string,
    onActivateAbility: func
  }

  handleClick = () => {
    this.props.onActivateAbility(this.props.idx);
  }

  render() {
    const { marginBottom, text } = this.props;
    return (
      <div style={{ marginBottom }}>
        <RaisedButton
          backgroundColor={'rgb(230, 230, 230)'}
          label={<span><b>Activate</b>: {text}.</span>}
          labelStyle={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: 300,
            overflow: 'hidden',
            display: 'block'
          }}
          onClick={this.handleClick} />
      </div>
    );
  }
}

import RaisedButton from 'material-ui/RaisedButton';
import * as React from 'react';

interface ActivatedAbilityProps {
  idx: number
  marginBottom: number
  text: string
  onActivateAbility: (idx: number) => void
}

export default class ActivatedAbility extends React.Component<ActivatedAbilityProps> {
  public render(): JSX.Element {
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
          onClick={this.handleClick}
        />
      </div>
    );
  }

  private handleClick = () => {
    this.props.onActivateAbility(this.props.idx);
  }
}

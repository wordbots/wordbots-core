import Button from '@material-ui/core/Button';
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
        <Button
          variant="contained"
          style={{ backgroundColor: 'rgb(230, 230, 230)' }}
          onClick={this.handleClick}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              width: 300,
              overflow: 'hidden',
              display: 'block'
            }}
          >
            <b>Activate</b>: {text}.
          </span>
        </Button>
      </div>
    );
  }

  private handleClick = () => {
    this.props.onActivateAbility(this.props.idx);
  }
}

import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import { Layout } from './types.enums';

interface LayoutControlsProps {
  layout: Layout
  onSetLayout: (layout: Layout) => void
}

export default class LayoutControls extends React.Component<LayoutControlsProps> {
  public shouldComponentUpdate(newProps: LayoutControlsProps): boolean {
    return (newProps.layout !== this.props.layout);
  }

  get baseIconStyle(): Record<string, any> {
    return {
      fontSize: 36,
      padding: 10,
      borderRadius: 3,
      boxShadow: '1px 1px 3px #CCC',
      cursor: 'pointer',
      width: '40%',
      textAlign: 'center'
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 20
          }}
        >
          Layout
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          {this.renderButton(0, 'view_module')}
          {this.renderButton(1, 'view_list')}
        </div>
      </div>
    );
  }

  private handleSetLayout = (layout: Layout) => () => {
    this.props.onSetLayout(layout);
  }

  private renderButton(layout: Layout, iconName: string): JSX.Element {
    const selected = (this.props.layout === layout);
    return (
      <Icon
        className="material-icons"
        style={{
          ...this.baseIconStyle,
          color: selected ? 'white' : 'black',
          backgroundColor: selected ? '#F44336' : '#EEEEEE'
        }}
        onClick={this.handleSetLayout(layout)}
      >
        {iconName}
      </Icon>
    );
  }

}

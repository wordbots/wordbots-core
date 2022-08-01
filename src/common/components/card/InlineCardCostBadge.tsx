import * as React from 'react';

export default class InlineCardCostBadge extends React.PureComponent<{ cost: number, style?: React.CSSProperties }> {
  public render(): JSX.Element {
    return (
      <span style={{
        display: 'flex',
        flexFlow: 'row wrap',
        placeContent: 'center',
        alignItems: 'center',
        fontWeight: 500,
        fontSize: 12,
        width: 28,
        height: 24,
        borderRadius: '50%',
        backgroundColor: 'rgb(0, 188, 212)',
        color: 'white',
        fontFamily: '"Carter One", "Carter One-fallback"',
        ...this.props.style
      }}>
        {this.props.cost}
      </span>
    );
  }
}

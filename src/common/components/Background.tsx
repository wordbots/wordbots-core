import * as React from 'react';

interface BackgroundProps {
  asset: string
  opacity: number
  style?: React.CSSProperties
}

export default class Background extends React.PureComponent<BackgroundProps> {
  public render(): JSX.Element {
    const { asset, opacity, style } = this.props;
    return (
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          left: 0,
          zIndex: -1,
          background: `url('/static/artAssets/${asset}')`,
          backgroundSize: 'cover',
          opacity,
          ...style
        }}
      />
    );
  }
}

import Paper from '@material-ui/core/Paper';
import * as React from 'react';

interface TitleProps {
  text: string
  small?: boolean
  style?: React.CSSProperties
}

export default class Title extends React.PureComponent<TitleProps> {
  public render(): JSX.Element {
    const { text, small, style } = this.props;
    return (
      <Paper
        style={{
          display: 'inline-block',
          marginLeft: 20,
          padding: '5px 15px',
          fontSize: small ? 16 : 24,
          fontFamily: 'Carter One',
          color: 'white',
          backgroundColor: '#f44336',
          opacity: 0.8,
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
          ...style
        }}
      >
        {text}
      </Paper>
    );
  }
}

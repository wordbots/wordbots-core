import * as React from 'react';

import PaperButton from './PaperButton';

interface SplashSectionProps {
  title: string
  children: string | Array<string | JSX.Element>
  imgPath?: string
  onClick: () => void
}

// eslint-disable-next-line react/prefer-stateless-function
export default class SplashSection extends React.PureComponent<SplashSectionProps> {
  public render(): JSX.Element {
    const { title, children, imgPath, onClick } = this.props;
    return (
      <PaperButton
        onClick={onClick}
        style={{
          width: 600,
          minHeight: 112,
          margin: '15px auto',
          padding: 5,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div>
          <img src={imgPath} style={{ width: 170, borderRadius: 5 }} />
        </div>
        <div style={{ padding: '0 10px', width: '100%' }}>
          <div
            style={{
              textAlign: 'center',
              fontSize: 32,
              fontFamily: 'Carter One',
              color: '#f44336',
              WebkitTextStroke: '1px black'
            }}
          >
            {title}
          </div>
          <div style={{ color: '#333', textAlign: 'center', width: '100%' }}>
            {children}
          </div>
        </div>
      </PaperButton>
    );
  }
}

import React from 'react';
import { number, string } from 'prop-types';

const FullscreenMessage = ({ message, height }) =>
  <div style={{
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height,
    zIndex: 9999,
    background: `url(${this.loadBackground()})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Carter One',
    fontSize: 26,
    color: 'white'
  }}>
    {message}
  </div>;

FullscreenMessage.propTypes = {
  message: string,
  height: number
};

export default FullscreenMessage;

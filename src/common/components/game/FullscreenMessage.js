import * as React from 'react';
import { number, string } from 'prop-types';

import { BACKGROUND_Z_INDEX } from '../../constants.ts';

const FullscreenMessage = ({ message, height, background }) =>
  <div style={{
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height,
    zIndex: BACKGROUND_Z_INDEX,
    background: `url(${background})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Carter One',
    fontSize: 32,
    color: 'white'
  }}>
    {message}
  </div>;

FullscreenMessage.propTypes = {
  message: string,
  height: number,
  background: string
};

export default FullscreenMessage;

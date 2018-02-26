import React from 'react';
import { bool, string } from 'prop-types';
import Notification from 'react-web-notification';

const GameNotification = ({ enabled, text }) => {
  const options = {
      tag: 'wordbots',
      icon: '/static/icons/android-icon-144x144.png',
      lang: 'en',
      dir: 'ltr',
      timestamp: Math.floor(Date.now())
    };

  if (enabled) {
    return (
      <Notification
        timeout={2000}
        title="Wordbots."
        options={{ ...options, body: text }}
        onClick={window.focus} />
    );
  } else {
    return null;
  }
};

GameNotification.propTypes = {
  enabled: bool,
  text: string
};

export default GameNotification;

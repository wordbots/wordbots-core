import * as React from 'react';
import Notification from 'react-web-notification';

interface GameNotificationProps {
  enabled: boolean
  text: string
}

export default class GameNotification extends React.Component<GameNotificationProps> {
  public render(): JSX.Element | null {
    const { enabled, text } = this.props;
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
          onClick={window.focus}
        />
      );
    } else {
      return null;
    }
  }
}

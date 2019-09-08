import * as fb from 'firebase';
import * as React from 'react';
import { Link } from 'react-router-dom';

interface ProfileLinkProps {
  uid: string
  username: string
  className?: string
  style?: React.CSSProperties
}

export default class ProfileLink extends React.Component<ProfileLinkProps> {
  public static fromFirebaseUser = (user: fb.User) => (
    <ProfileLink uid={user.uid} username={user.displayName || user.uid} />
  )

  get shouldOpenInNewTab(): boolean {
    // It doesn't make sense to open a profile in a new tab if we're already on a profile page.
    return !window.location.pathname.startsWith('/profile/');
  }

  public render(): React.ReactNode {
    const { uid, username, className, style } = this.props;
    const href = `/profile/${uid}`;

    if (uid.startsWith('guest_')) {
      return username;
    }

    // If we're already on a profile page, render an internal link.
    // Otherwise, open the link in a new tab.
    if (window.location.pathname.startsWith('/profile/')) {
      return <Link to={href} className={`profile-link ${className || ''}`} style={style}>{username}</Link>;
    } else {
      return (
        <a
          href={href}
          className={`profile-link ${className || ''}`}
          style={style}
          target="_blank"
          rel="noopener noreferrer"
        >
          {username}
        </a>
      );
    }
  }
}

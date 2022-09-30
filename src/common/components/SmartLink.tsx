import * as React from 'react';
import { Link } from 'react-router-dom';

interface SmartLinkProps {
  href: string
  children: JSX.Element[]
}

// Renders <Link>s for internal links and <a>s for exteral links.
export default class SmartLink extends React.PureComponent<SmartLinkProps> {
  public render(): JSX.Element {
    const { href, children } = this.props;
    const style: React.CSSProperties = { color: 'rgb(0, 120, 135)', fontWeight: 'bold' };

    if (href.match(/^(https?:)?\/\//) || href.match(/\.(png|jpg)$/i)) {
      return (
        <a href={href} className="underline" style={style} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    } else {
      return <Link to={href} className="underline" style={style}>{children}</Link>;
    }
  }
}

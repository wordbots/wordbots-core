import * as React from 'react';
import { Link } from 'react-router-dom';

interface SmartLinkProps {
  href: string
  children: JSX.Element[]
}

// Renders <Link>s for internal links and <a>s for exteral links.
export default class SmartLink extends React.Component<SmartLinkProps> {
  public render(): JSX.Element {
    const { href, children } = this.props;
    const style: React.CSSProperties = {color: 'red', fontWeight: 'bold'};

    if (href.match(/^(https?:)?\/\//)) {
      return (
        <a href={href} style={style} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    } else {
      return <Link to={href} style={style}>{children}</Link>;
    }
  }
}

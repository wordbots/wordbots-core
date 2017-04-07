import React from 'react';
import { Link } from 'react-router-dom';

// Renders <Link>s for internal links and <a>s for exteral links.
const SmartLink = (props) => {
  const style = {color: 'red', fontWeight: 'bold'};

  if (props.href.match(/^(https?:)?\/\//)) {
    return <a href={props.href} style={style}>{props.children}</a>;
  } else {
    return <Link to={props.href} style={style}>{props.children}</Link>;
  }
};

const { array, string } = React.PropTypes;

SmartLink.propTypes = {
  href: string,
  children: array
};

export default SmartLink;

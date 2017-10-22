import React from 'react';
import { arrayOf, element, string } from 'prop-types';
import { Link } from 'react-router-dom';

// Renders <Link>s for internal links and <a>s for exteral links.
const SmartLink = (props) => {
  const style = {color: 'red', fontWeight: 'bold'};

  if (props.href.match(/^(https?:)?\/\//)) {
    return (
      <a href={props.href} style={style} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    );
  } else {
    return <Link to={props.href} style={style}>{props.children}</Link>;
  }
};

SmartLink.propTypes = {
  href: string,
  children: arrayOf(element)
};

export default SmartLink;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

/* eslint-disable react/no-multi-comp */

const RouterLink = (props) => {
  const style = {color: 'red', fontWeight: 'bold'};

  if (props.href.match(/^(https?:)?\/\//)) {
    return <a href={props.href} style={style}>{props.children}</a>;
  } else {
    return <Link to={props.href} style={style}>{props.children}</Link>;
  }
};

const MarkdownBlock = (props) => (
  <ReactMarkdown
    source={props.source}
    containerProps={{className: 'markdownBlock'}}
    renderers={{Link: RouterLink}} />
);

const { array, string } = React.PropTypes;

RouterLink.propTypes = {
  href: string,
  children: array
};

MarkdownBlock.propTypes = {
  source: string
};

export default MarkdownBlock;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';

/* eslint-disable react/no-multi-comp */

const RouterLink = (props) => (
  props.href.match(/^(https?:)?\/\//)
    ? <a href={props.href}>{props.children}</a>
    : <Link to={props.href}>{props.children}</Link>
);

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

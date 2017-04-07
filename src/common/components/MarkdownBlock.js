import React from 'react';
import ReactMarkdown from 'react-markdown';

import SmartLink from './SmartLink';

const MarkdownBlock = (props) => (
  <ReactMarkdown
    source={props.source}
    containerProps={{className: 'markdownBlock'}}
    renderers={{Link: SmartLink}} />
);

const { string } = React.PropTypes;

MarkdownBlock.propTypes = {
  source: string
};

export default MarkdownBlock;

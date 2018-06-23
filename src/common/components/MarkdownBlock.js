import * as React from 'react';
import { string } from 'prop-types';
import * as ReactMarkdown from 'react-markdown';

import SmartLink from './SmartLink';

const MarkdownBlock = (props) => (
  <ReactMarkdown
    source={props.source}
    className="markdownBlock"
    renderers={{Link: SmartLink}} />
);

MarkdownBlock.propTypes = {
  source: string
};

export default MarkdownBlock;

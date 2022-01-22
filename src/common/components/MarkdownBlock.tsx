import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';

import SmartLink from './SmartLink';

interface MarkdownBlockProps {
  source: string
  renderers?: Partial<{ [K in ReactMarkdown.NodeType]: React.ReactType }>
}

const MarkdownBlock = (props: MarkdownBlockProps): JSX.Element => (
  <ReactMarkdown
    source={props.source}
    className="markdownBlock"
    renderers={{ link: SmartLink, ...(props.renderers || {}) }}
  />
);

export default MarkdownBlock;

import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';

import SmartLink from './SmartLink';

export default class MarkdownBlock extends React.Component<{ source: string }> {
  public render(): JSX.Element {
    return (
      <ReactMarkdown
        source={this.props.source}
        className="markdownBlock"
        renderers={{ Link: SmartLink }}
      />
    );
  }
}

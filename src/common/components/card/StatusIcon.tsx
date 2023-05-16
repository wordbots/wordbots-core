import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import { PARSER_URL } from '../../constants';
import { expandKeywords } from '../../util/cards';
import Tooltip from '../Tooltip';

interface StatusIconProps {
  text: string
  result: { js?: string, parsed?: boolean, error?: string } | null
}

export default class StatusIcon extends React.Component<StatusIconProps> {
  public render(): JSX.Element | null {
    const { text, result } = this.props;
    if (result !== null) {
      const isParsed = result.js || result.parsed;

      const icon = (
        <Tooltip
          inline
          text={isParsed ? 'Click to view parse tree' : (result.error || 'Parsing ...')}
        >
          <Icon
            className="material-icons"
            style={{
              fontSize: '0.7em',
              verticalAlign: 'top',
              color: isParsed ? 'green' : (result.error ? 'red' : 'black')
            }
            }
          >
            {isParsed ? 'code' : (result.error ? 'error_outline' : 'more_horiz')}
          </Icon>
        </Tooltip>
      );

      if (isParsed) {
        const parserInput = encodeURIComponent(expandKeywords(text));
        const treeUrl = `${PARSER_URL}/parse?input=${parserInput}&format=svg`;

        return (
          <a href={treeUrl} target="_blank" rel="noopener noreferrer">
            {icon}
          </a>
        );
      } else {
        return icon;
      }
    } else {
      return null;
    }
  }
}

import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import { isObject } from 'lodash';

import { PARSER_URL } from '../../constants';
import { expandKeywords } from '../../util/cards';
import Tooltip from '../Tooltip';

function StatusIcon(text, result) {
  if (isObject(result)) {
    const isParsed = result.js || result.parsed;

    const icon = (
      <Tooltip
        inline
        text={isParsed ? 'Click to view parse tree' : (result.error || 'Parsing ...')}
      >
        <FontIcon
          className="material-icons"
          style={{
            fontSize: '0.7em',
            verticalAlign: 'top',
            color: isParsed ? 'green' : (result.error ? 'red' : 'black')}
        }>
          {isParsed ? 'code' : (result.error ? 'error_outline' : 'more_horiz')}
        </FontIcon>
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
  }
}

export default StatusIcon;

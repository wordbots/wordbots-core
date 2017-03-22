import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import ReactTooltip from 'react-tooltip';
import { isObject } from 'lodash';

import { expandKeywords } from '../../keywords';
import { id } from '../../util';

function StatusIcon(text, result) {
  if (isObject(result)) {
    const isParsed = result.js || result.parsed;
    const tooltipId = id();

    const icon = (
      <span>
        <FontIcon
          className="material-icons"
          style={{
            fontSize: '0.7em',
            verticalAlign: 'top',
            color: isParsed ? 'green' : (result.error ? 'red' : 'black')}
          }
          data-for={tooltipId}
          data-tip={isParsed ? 'Click to view parse tree' : (result.error || 'Parsing ...')}>
            {isParsed ? 'code' : (result.error ? 'error_outline' : 'more_horiz')}
        </FontIcon>
        <ReactTooltip id={tooltipId} />
      </span>
    );

    if (isParsed) {
      const parserInput = encodeURIComponent(expandKeywords(text));
      const treeUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=svg`;

      return (
        <a href={treeUrl} target="_blank">
          {icon}
        </a>
      );
    } else {
      return icon;
    }
  }
}

export default StatusIcon;

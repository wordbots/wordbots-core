import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import ReactTooltip from 'react-tooltip';

import { expandKeywords } from '../../keywords';
import { id } from '../../util';

function StatusIcon(text, result) {
  const parserInput = encodeURIComponent(expandKeywords(text));
  const treeUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=svg`;
  const tooltipId = id();

  if (result.js || result.parsed) {
    return (
      <a href={treeUrl} target="_blank">
        <FontIcon
          className="material-icons"
          style={{fontSize: '0.7em', verticalAlign: 'top', color: 'green'}}
          data-for={tooltipId}
          data-tip="Click to view parse tree">
            code
        </FontIcon>
        <ReactTooltip id={tooltipId} />
      </a>
    );
  } else if (result.error) {
    return (
      <span>
        <FontIcon
          className="material-icons"
          style={{fontSize: '0.7em', verticalAlign: 'top', color: 'red'}}
          data-for={tooltipId}
          data-tip={result.error}>
            error_outline
        </FontIcon>
        <ReactTooltip id={tooltipId} />
      </span>
    );
  }
}

export default StatusIcon;

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
    const tooltipText = isParsed ? 'Click to view parse tree' : (result.error || 'Parsing ...');
    const iconGlyph = isParsed ? 'code' : (result.error ? 'error_outline' : 'more_horiz');
    const iconColor = result.js ? 'green' : (result.error ? 'red' : 'black');

    const icon = [
      <FontIcon
        className="material-icons"
        style={{fontSize: '0.7em', verticalAlign: 'top', color: iconColor}}
        data-for={tooltipId}
        data-tip={tooltipText}>
          {iconGlyph}
      </FontIcon>,
      <ReactTooltip id={tooltipId} />
    ];

    if (isParsed) {
      const parserInput = encodeURIComponent(expandKeywords(text));
      const treeUrl = `https://wordbots.herokuapp.com/parse?input=${parserInput}&format=svg`;

      return (
        <a href={treeUrl} target="_blank">
          {icon}
        </a>
      );
    } else {
      return (<span>{icon}</span>);
    }
  }
}

export default StatusIcon;

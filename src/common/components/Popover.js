import * as React from 'react';
import { arrayOf, bool, element, object, oneOfType, string } from 'prop-types';
import * as ReactPopover from 'react-popover';

import { getGameAreaNode } from '../util/browser';

const Popover = (props) => (
  <ReactPopover
    isOpen={props.isOpen}
    style={props.style}
    tipSize={props.showTip ? 15 : 0.01}
    body={props.body}
    refreshIntervalMs={50}
    place={props.place}
    preferPlace={props.preferPlace}
    appendTarget={getGameAreaNode()}
  >
    {props.children}
  </ReactPopover>
);

Popover.propTypes = {
  isOpen: bool,
  style: object,
  body: element.isRequired,
  children: oneOfType([arrayOf(element), element]),
  place: string,
  preferPlace: string,
  showTip: bool
};

Popover.defaultProps = {
  isOpen: true,
  style: {},
  showTip: true
};

export default Popover;

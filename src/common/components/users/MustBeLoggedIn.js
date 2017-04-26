import React from 'react';
import { array, bool, object, oneOfType } from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { pick } from 'lodash';

import { id } from '../../util/common';

const MustBeLoggedIn = (props) => {
  if (props.loggedIn) {
    return (
      <div>
        {props.children}
      </div>
    );
  } else {
    const tooltipId = id();
    return (
      <div className="notAllowed">
        <ReactTooltip id={tooltipId} />
        {
          React.Children.map(props.children, child =>
            <div
              data-for={tooltipId}
              data-tip="You must be logged in to perform this action."
              style={
                pick(child.props.style, ['float', 'width', 'margin', 'marginTop', 'marginRight'])
            }>
              {
                React.cloneElement(child, {
                  disabled: true,
                  style: {
                    ...child.props.style,
                    float: 'none',
                    width: child.props.style.width ? '100%' : null,
                    margin: 0
                  }
                })
              }
            </div>
          )
        }
      </div>
    );
  }
};

MustBeLoggedIn.propTypes = {
  loggedIn: bool,
  children: oneOfType([array, object])
};

export default MustBeLoggedIn;

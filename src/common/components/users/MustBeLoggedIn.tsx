import { compact, isArray, isObject, pick } from 'lodash';
import * as React from 'react';

import Tooltip from '../Tooltip';

interface MustBeLoggedInProps {
  loggedIn: boolean
  style?: React.CSSProperties
  children: React.ReactChild | Array<React.ReactChild | null>
}

export default class MustBeLoggedIn extends React.Component<MustBeLoggedInProps> {
  get children(): React.ReactChild[] {
    const children = this.props.children as React.ReactChild | Array<React.ReactChild | null>;
    return isArray(children) ? compact(children) : [children];
  }

  public render(): JSX.Element {
    const { loggedIn, style } = this.props;
    if (loggedIn) {
      return (
        <div style={style}>
          {this.children}
        </div>
      );
    } else {
      return (
        <div className="notAllowed" style={style}>
          {React.Children.map(this.children, this.renderDisabledChild)}
        </div>
      );
    }
  }

  private renderDisabledChild(child: React.ReactChild): React.ReactChild {
    if (!child || !isObject(child)) {
      return child;
    }

    const propagatedStyleKeys = ['float', 'width', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'];

    const childStyle = (child as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {};
    const parentStyle = pick(childStyle, propagatedStyleKeys);
    const disabledChildStyle: React.CSSProperties = {
      ...childStyle,
      float: 'none',
      width: childStyle.width ? '100%' : undefined,
      margin: 0
    };

    return (
      <Tooltip text="You must be logged in to perform this action.">
        <div style={parentStyle}>
          {
            React.cloneElement(
              child as React.ReactElement<{ disabled?: boolean, style?: React.CSSProperties }>,
              { disabled: true, style: disabledChildStyle }
            )
          }
        </div>
      </Tooltip>
    );
  }
}

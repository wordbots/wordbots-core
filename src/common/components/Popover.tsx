import * as React from 'react';
import * as ReactPopover from 'react-popover';

import { getGameAreaNode } from '../util/browser';

interface PopoverProps {
  isOpen?: boolean
  style?: React.CSSProperties
  body: JSX.Element
  children: React.ReactNode
  place?: ReactPopover.PopoverPlace
  preferPlace?: ReactPopover.PopoverPlace
  showTip?: boolean
}

export default class Popover extends React.Component<PopoverProps> {
  get isOpen(): boolean {
    return this.props.isOpen !== undefined ? this.props.isOpen : true;
  }

  get showTip(): boolean {
    return this.props.showTip !== undefined ? this.props.showTip : true;
  }

  public render(): JSX.Element {
    return (
      <ReactPopover
        isOpen={this.isOpen}
        style={this.props.style}
        tipSize={this.showTip ? 15 : 0.01}
        body={this.props.body}
        refreshIntervalMs={50}
        place={this.props.place}
        preferPlace={this.props.preferPlace}
        appendTarget={getGameAreaNode()}
      >
        {this.props.children}
      </ReactPopover>
    );
  }
}

import React, {Component} from 'react';
import {object, string} from 'prop-types';

import HexUtils from './HexUtils';
import loadImages from './HexGridImages';

export default class FillPattern extends Component {
  static propTypes = {
    hex: object.isRequired,
    fill: string
  };

  get images() {
    return loadImages();
  }

  render() {
    const id = HexUtils.getID(this.props.hex);
    const fillImage = this.props.fill
      ? this.images[`${this.props.fill}_tile`]
      : this.images['floor'];

    return (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" x="-15" y="-10" width="30" height="20">
          <image xlinkHref={fillImage} x="0" y="0" width="30" height="20" />
        </pattern>
      </defs>
    );
  }
}

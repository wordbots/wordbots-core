import * as React from 'react';

import Hex from './Hex';
import loadImages from './HexGridImages';
import HexUtils from './HexUtils';
import { PreLoadedImageName } from './types';

interface FillPatternProps {
  hex: Hex
  fill?: string
}

export default class FillPattern extends React.Component<FillPatternProps> {
  get images(): Record<PreLoadedImageName, any> {
    return loadImages();
  }

  public render(): JSX.Element {
    const { hex, fill } = this.props;
    const id = HexUtils.getID(hex);
    const fillImage = this.images[fill ? `${fill}_tile` : 'floor'];

    return (
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" x="-15" y="-10" width="30" height="20">
          <image xlinkHref={fillImage} x="0" y="0" width="30" height="20" />
        </pattern>
      </defs>
    );
  }
}

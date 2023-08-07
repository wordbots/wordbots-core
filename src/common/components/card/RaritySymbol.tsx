import { capitalize } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import { BROWSER_INFO } from '../../util/browser';
import Tooltip from '../Tooltip';

interface RaritySymbolProps {
  rarity: w.CardInSetRarity
  scale?: number
  isEditing?: boolean
}

export default function RaritySymbol({ rarity, scale, isEditing }: RaritySymbolProps): JSX.Element {
  const isLinux: boolean = BROWSER_INFO?.os?.toLowerCase() === 'linux';

  // We need to ensure that the symbols are all rendered in the same font, so we can be reasonably sure of rendering them all visually at the same size.
  // Because some Linux distros don't have Arial by default, we use DejaVu Sans in the font stack and try to ensure that it actually gets used (but ONLY on Linux).
  // So, below, isLinux is really a proxy for isFontDejaVuSans (unfortunately it's not metrically compatible with Arial/Helvetica, so we have to special-case it ...)
  const fontFamily = isLinux ? '"DejaVu Sans", sans-serif' : 'Arial, Helvetica, sans-serif';

  return (
    <span style={{
      display: 'inline-block',
      userSelect: 'none',
      fontFamily,
      fontSize: (isLinux ? 17 : ({ rare: 17, uncommon: 21, common: 26 })[rarity]) * (scale || 1),
      marginTop: (isLinux ? 5 : ({ rare: 5, uncommon: 3, common: -1 })[rarity]) * (scale || 1),
      marginLeft: (isLinux ? -1 : ({ rare: -1, uncommon: -2, common: 0 })[rarity]) * (scale || 1),
      color: ({ rare: '#d4af37', uncommon: '#aaa9ad', common: undefined })[rarity]
    }}>
      <Tooltip
        key={rarity}
        text={`${capitalize(rarity)}${isEditing ? ' (click to change)' : ''}`}
        place="left"
        className="card-part-tooltip"
      >
        {
          ({
            'common': '●',
            'uncommon': '◆',
            'rare': '★'
          })[rarity]
        }
      </Tooltip>
    </span>
  );
}

import { capitalize } from 'lodash';
import * as React from 'react';

import * as w from '../../types';
import Tooltip from '../Tooltip';

interface RaritySymbolProps {
  rarity: w.CardInSetRarity
  scale?: number
  isEditing?: boolean
}

export default function RaritySymbol({ rarity, scale, isEditing }: RaritySymbolProps): JSX.Element {
  return (
    <span style={{
      display: 'inline-block',
      userSelect: 'none',
      fontSize: ({ rare: 17, uncommon: 27, common: 26 })[rarity] * (scale || 1),
      marginTop: ({ rare: 5, uncommon: -3, common: 0 })[rarity] * (scale || 1),
      marginLeft: ({ rare: -1, uncommon: -2, common: 0 })[rarity] * (scale || 1),
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

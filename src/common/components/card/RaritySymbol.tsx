import * as React from 'react';

import * as w from '../../types';
import { symbolForRarity } from '../../util/sets';
import Tooltip from '../Tooltip';

interface RaritySymbolProps {
  rarity: w.CardInSetRarity
  scale?: number
}

export default function RaritySymbol({ rarity, scale }: RaritySymbolProps): JSX.Element {
  return (
    <span style={{
      display: 'inline-block',
      userSelect: 'none',
      fontSize: ({ rare: 17, uncommon: 27, common: 26 })[rarity] * (scale || 1),
      marginTop: ({ rare: 5, uncommon: -1, common: 0 })[rarity] * (scale || 1),
      marginLeft: ({ rare: -1, uncommon: -2, common: 0 })[rarity] * (scale || 1),
      color: ({ rare: '#D4AF37', uncommon: '#aaa9ad', common: undefined })[rarity]
    }}>
      <Tooltip key={rarity} text={rarity} place="left" className="rarity-tooltip">
        {symbolForRarity(rarity)}
      </Tooltip>
    </span>
  );
}

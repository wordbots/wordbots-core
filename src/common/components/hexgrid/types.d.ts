import * as w from '../../types';

import Hex from './Hex';
import Point from './Point';

export type PreLoadedImageName = string;

export interface Actions {
  onClick: (hex: Hex, evt: React.MouseEvent<any>) => void
  onHexHover: (hex: Hex, evt: React.MouseEvent<any>) => void
  onActivateAbility: (abilityIdx: number) => void
  onTutorialStep: (prev: boolean) => void
  onEndGame: () => void
}

export interface GridConfig {
  layout: LayoutParams
  origin: Point
  map: string
  mapProps: any
}

export interface LayoutParams {
  flat: boolean
  width: number
  height: number
  spacing: number
}

export interface PieceOnBoard {
  id: string
  type: w.CardType
  image: { img: PreLoadedImageName } | { sprite: string }
  card: w.CardInGame
  stats: {
    health: number
    attack?: number
    speed?: number
    movesUsed?: number
    movesAvailable?: number
  }
  abilities: w.PassiveAbility[]
  triggers: w.TriggeredAbility[]
  attacking: w.HexId | null
  isDamaged: boolean
  effects: Array<w.EffectType | 'taunt'>
}

import Icon from '@material-ui/core/Icon';
import * as React from 'react';

import * as w from '../../types';
import { BUILTIN_FORMATS, SetFormat } from '../../util/formats';
import Tooltip from '../Tooltip';

interface DeckValidationIndicatorProps {
  cards: w.CardInStore[]
  deck?: w.DeckInStore
  set?: w.Set
  hideNumCards?: boolean
}

export default class DeckValidationIndicator extends React.Component<DeckValidationIndicatorProps> {
  get deck(): w.DeckInGame {
    const { cards, deck, set } = this.props;
    const dummyDeck = { id: '', authorId: '', name: '', cardIds: [] };
    return  {...(deck || dummyDeck), cards, setId: set ? set.id : null };
  }

  get isValidInSetFormat(): boolean {
    return !!this.props.set && new SetFormat(this.props.set).isDeckValid(this.deck);
  }

  get numValidFormats(): number {
    const numValidBuiltinFormats = BUILTIN_FORMATS.filter((format) => format.isDeckValid(this.deck)).length;
    return numValidBuiltinFormats + (this.isValidInSetFormat ? 1 : 0);
  }

  get isValid(): boolean {
    return this.numValidFormats > 0;
  }

  get validFormatsHTML(): string {
    const { set } = this.props;
    const redX = '<span style="color: red;">X</span>';
    const greenCheck = '<span style="color: green;">✓</span>';
    const setFormatHTML = set && this.isValidInSetFormat
      ? `${greenCheck} valid in the '${set.name}' set (by ${set.metadata.authorName}) format`
      : `${redX} not valid in any Set formats`;

    return BUILTIN_FORMATS.map((format) =>
      `${format.isDeckValid(this.deck) ? `${greenCheck} valid` : `${redX} not valid`} in ${format.displayName} format`
    ).concat(setFormatHTML)
     .join('<br>');
  }

  public render(): JSX.Element {
    const { cards, hideNumCards } = this.props;
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          textAlign: 'right',
          fontSize: 24,
          fontWeight: 'normal',
          color: (this.isValid ? 'green' : 'red')
        }}
      >
        <Tooltip inline html text={this.validFormatsHTML} style={{textAlign: 'left'}} additionalStyles={{cursor: 'help'}}>
          <Icon
            className="material-icons"
            style={{paddingRight: 5, color: (this.isValid ? 'green' : 'red') }}
          >
            {this.isValid ? 'done' : 'warning'}
          </Icon>
          <sup
            style={{
              fontSize: '0.5em',
              marginLeft: -5,
              marginRight: 5
            }}
          >
            {this.numValidFormats}&thinsp;[?]
          </sup>
        </Tooltip>
        {!hideNumCards && `${cards.length} cards`}
      </div>
    );
  }
}

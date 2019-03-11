import * as express from 'express';
import { resolve } from 'path';
import { parse as urlparse } from 'url';
import { ParsedUrlQuery } from 'querystring';

import { id } from '../common/util/common';
import Card, { CardProps } from '../common/components/card/Card';
import Sentence from '../common/components/card/Sentence';

const repng = require('repng');

export default function produceApiResponse(response: express.Response, location: string): void {
  const { pathname, query } = urlparse(location, true);

  console.info(`Received API request: ${location}`);  // tslint:disable-line
  if (pathname === '/api/card.png') {
    renderCard(response, query);
  } else {
    console.warn(`Unknown path: ${pathname}`);  // tslint:disable-line
  }
}

function renderCard(response: express.Response, query: ParsedUrlQuery): void {
  const cardJson = (query.card as string).replace(/%27/g, '\\"').replace(/\n/g, '\\n');
  const card = JSON.parse(cardJson);

  const props: CardProps = {
    id: '',
    name: card.name,
    type: card.type,
    cost: card.cost,
    baseCost: card.cost,
    text: Sentence.fromText(card.text),
    rawText: card.text,
    stats: card.stats,
    cardStats: card.stats,
    source: card.source,
    visible: true
  };

  const filename = id();

  repng(Card, {
    props,
    width: 170,
    height: 250,
    outDir: './temp/',
    filename
  }).then(() => {
    response.sendFile(resolve(`./temp/${filename}.png`));
  }).catch((error: any) => {
    response
      .status(500)
      .end(error);
  });
}

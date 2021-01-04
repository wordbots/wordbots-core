import { ParsedUrlQuery } from 'querystring';
import { parse as urlparse } from 'url';

import * as express from 'express';
import * as repng from 'repng';

import Card, { CardProps } from '../common/components/card/Card';
import Sentence from '../common/components/card/Sentence';

export default function produceApiResponse(response: express.Response, location: string): void {
  const { pathname, query } = urlparse(location, true);

  console.info(`Received API request: ${location}`);
  if (pathname === '/api/card.png') {
    renderCard(response, query);
  } else {
    console.warn(`Unknown path: ${pathname}`);
  }
}

function renderCard(response: express.Response, query: ParsedUrlQuery): void {
  const cardJson = (query.card as string).replace(/%27/g, '\\"').replace(/\n/g, '\\n');
  const card = JSON.parse(cardJson);

  const props: CardProps = {
    id: '',
    visible: true,
    name: card.name,
    type: card.type,
    cost: card.cost,
    baseCost: card.cost,
    text: Sentence.fromText(card.text),
    rawText: card.text,
    stats: card.stats,
    cardStats: card.stats,
    source: card.source,
    spriteID: card.spriteID,
    spriteV: card.spriteV
  };

  repng(Card, {
    props,
    width: 170,
    height: 250,
    css: '.MuiPaper-root-1 { background: white; }',
    puppeteer: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    }
  }).then((img: Buffer) => {
    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    response.end(img);
  }).catch((error: any) => {
    console.error(error.stack);
    response
      .status(500)
      .end(error.message);
  });
}

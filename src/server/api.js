import {resolve} from 'path';
import url from 'url';

import repng from 'repng';

import {id} from '../common/util/common';
import {splitSentences} from '../common/util/cards';
import Card from '../common/components/card/Card';
import Sentence from '../common/components/card/Sentence';

export default function produceApiResponse(response, location){
  const {pathname, query} = url.parse(location, true);

  if (pathname === '/api/card.png') {
    renderCard(response, query);
  }
}

function renderCard(response, query){
  const cardJson = query.card.replace(/%27/g, '\\"').replace(/\n/g, '\\n');
  const card = JSON.parse(cardJson);

  const props = {
    name: card.name,
    type: card.type,
    cost: card.cost,
    baseCost: card.cost,
    text: splitSentences(card.text).map(Sentence),
    rawText: card.text,
    stats: card.stats,
    cardStats: card.stats,
    source: card.source
  };

  const filename = id();

  repng(Card, {
    props: props,
    width: 170,
    height: 250,
    outDir: './temp/',
    filename: filename
  })
    .then(() => {
      response.sendFile(resolve(`./temp/${filename}.png`));
    })
    .catch(err => {
      response.status(500).end(err);
    });
}

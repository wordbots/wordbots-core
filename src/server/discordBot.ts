import * as Discord from 'discord.js';
import { omit } from 'lodash';

import { typeToString } from '../common/constants';
import * as w from '../common/types';
import { getSentencesFromInput, requestParse } from '../common/util/cards';

// TODO this should really live in a separate process entirely?
export default function launch(): void {
  if (process.env.DISCORD_API_TOKEN) {
    const client = new Discord.Client();

    client.on('ready', () => {
      // eslint-disable-next-line no-console
      console.log(`Discord bot logged in as ${client.user!.tag}`);
    });

    const cardJsonPrefixTriggers = ['[{"id":"', '{"id":"', '[{"name":"'];
    client.on('message', msg => {
      if (msg.content.startsWith('/parse')) {
        // Parse card text
        const rawText = msg.content.split('/parse ')[1];
        const sentences: string[] = getSentencesFromInput(rawText);
        requestParse(sentences, '' as w.ParserMode, (_, sentence, parseResult) => {
          const response = `Parse result for **${sentence}**:\n\`\`\`${JSON.stringify(omit(parseResult, 'tokens'), null, 2)}\`\`\``;
          msg.channel.send(response);
        }, false);
      } else if (cardJsonPrefixTriggers.some((prefix) => msg.content.startsWith(prefix))) {
        // Format card from exported JSON
        const cardsRaw = JSON.parse(msg.content);
        const cards: w.CardInStore[] = Array.isArray(cardsRaw) ? cardsRaw : [cardsRaw];

        cards.forEach(({ id, name, type, cost, stats, text }) => {
          const url = `https://app.wordbots.io/card/${id}`;
          const typeStr = typeToString(type);
          const statsStr =
            stats
              ? (stats.attack ? `\n${stats.attack}/${stats.health}/${stats.speed}` : `0/${stats.health}/0`)
              : '';
          const response = `**${name}**\n${url}\n_${typeStr}_\nCost: ${cost}${text ? `\n${text}` : ''}${statsStr}`;
          msg.channel.send(response);
        });
      }
    });

    client.login(process.env.DISCORD_API_TOKEN);
  }
}

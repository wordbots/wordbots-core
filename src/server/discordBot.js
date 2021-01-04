const Discord = require('discord.js');

export default function launch() {
  console.log(process.env);
  if (process.env.DISCORD_API_TOKEN) {
    const client = new Discord.Client();

    client.on('ready', () => {
      console.log(`Discord bot logged in as ${client.user.tag}`);
    });

    const prefixTriggers = ['[{"id":"', '{"id":"', '[{"name":"'];
    client.on('message', msg => {
      if (prefixTriggers.some((prefix) => msg.content.startsWith(prefix))) {
        const cardsRaw = JSON.parse(msg.content);
        const cards = Array.isArray(cardsRaw) ? cardsRaw : [cardsRaw];

        cards.forEach(({ name, spriteID, type, cost, stats, text }) => {
          const card = {
            name: encodeURIComponent(name),
            spriteID,
            type,
            cost,
            stats,
            text: encodeURIComponent(text.replace('%27', '"'))
          };

          const imageUrl = `http://app.wordbots.io/api/card.png?card=${JSON.stringify(card)}`;
          const response = `**${name}**\n${text}\n${imageUrl}`;
          msg.channel.send(response);
        });
      }
    });

    client.login(process.env.DISCORD_API_TOKEN);
  }
}

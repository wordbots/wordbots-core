export default function actions(state) {
  return {
    draw: function (player, count) {
      player.hand = player.hand.concat(player.deck.splice(0, count));
    }
  };
}

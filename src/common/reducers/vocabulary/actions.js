export default function actions(state) {
  return {
    draw: function (players, count) {
      players.forEach(player =>
        player.hand = player.hand.concat(player.deck.splice(0, count))
      );
    },

    modifyEnergy: function (players, func) {
      players.forEach(player =>
        player.energy = _.assign(player.energy, {available: func(player.energy.available)})
      );
    },

    modifyAttribute: function (objects, attr, func) {
      console.log(objects);
      objects.forEach(object =>
        object.stats = _.assign(object.stats, {[attr]: func(object.stats[attr])})
      );
      console.log(objects);
    }
  };
}

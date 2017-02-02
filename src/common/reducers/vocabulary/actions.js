export default function actions(state) {
  return {
    // TODO canMoveAgain(objects)

    // TODO dealDamage(objects, amount)

    destroy: function (objects) {
      objects.forEach(function ([hex, object]) {
        delete state.players.blue.robotsOnBoard[hex];
        delete state.players.orange.robotsOnBoard[hex];
      });
    },

    // TODO discard(objects) -- requires choice?

    draw: function (players, count) {
      players.forEach(function (player) {
        player.hand = player.hand.concat(player.deck.splice(0, count));
      });
    },

    modifyAttribute: function (objects, attr, func) {
      objects.forEach(function ([hex, object]) {
        if (attr === 'allattributes') {
          object.stats = _.mapValues(object.stats, func);
        } else {
          object.stats = _.assign(object.stats, {[attr]: func(object.stats[attr])});
        }
      });
    },

    modifyEnergy: function (players, func) {
      players.forEach(function (player) {
        player.energy = _.assign(player.energy, {available: func(player.energy.available)});
      });
    },

    setAttribute: function (objects, attr, num) {
      objects.forEach(function ([hex, object]) {
        if (attr === 'allattributes') {
          object.stats = _.mapValues(object.stats, () => num);
        } else {
          object.stats = _.assign(object.stats, {[attr]: num});
        }
      });
    },
  };
}

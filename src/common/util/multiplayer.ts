/* Multiplayer-related functions used both in the client and server go here. */

import * as m from '../../server/multiplayer/multiplayer';

export const guestUID = (clientID: m.ClientID): string =>
  `guest_${clientID}`;

export const guestUsername = (clientID: m.ClientID): string =>
  `Guest_${clientID.slice(0, 6)}`;

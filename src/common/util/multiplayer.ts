// Multiplayer-related functions used both in the client and server go here.

import * as m from '../../server/multiplayer/multiplayer';

const GUEST_PREFIX = 'guest_';

/** Generates a guest user ID given a `ClientID`. */
export const guestUID = (clientID: m.ClientID): string =>
  `${GUEST_PREFIX}${clientID}`;

/** Generates a guest username given a `ClientID`. */
export const guestUsername = (clientID: m.ClientID): string =>
  `Guest_${clientID.slice(0, 6)}`;

/** Given a user id, returns whether it belongs to a guest user. */
export const isGuest = (userId: string): boolean =>
  userId.startsWith(GUEST_PREFIX);

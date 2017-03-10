export const REMOVE_FROM_COLLECTION = 'REMOVE_FROM_COLLECTION';

// Note: This actions is consumed by the collection AND game reducers!
export function removeFromCollection(ids) {
  return {
    type: REMOVE_FROM_COLLECTION,
    ids: ids
  };
}

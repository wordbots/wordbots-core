/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
// Why a separate file for just enums? See https://lukasbehal.com/2017-05-22-enums-in-declaration-files/

export enum SortCriteria {
  Timestamp,
  Cost,
  Name,
  Type,
  Attack,
  Health,
  Speed,
  RarityThenCost  // only used for SetSummary
}

export enum SortOrder {
  Ascending,
  Descending
}

export enum Layout {
  Grid,
  Table
}

// Why a separate file for just enums? See https://lukasbehal.com/2017-05-22-enums-in-declaration-files/

export enum SortCriteria {
  Cost,
  Name,
  Type,
  Creator,
  Attack,
  Health,
  Speed
}

export enum SortOrder {
  Ascending,
  Descending
}

export enum Layout {
  Grid,
  Table
}

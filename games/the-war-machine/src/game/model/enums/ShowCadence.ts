export enum Month {
  JANUARY = 1,
  FEBRUARY = 2,
  MARCH = 3,
  APRIL = 4,
  MAY = 5,
  JUNE = 6,
  JULY = 7,
  AUGUST = 8,
  SEPTEMBER = 9,
  OCTOBER = 10,
  NOVEMBER = 11,
  DECEMBER = 12,
}

export enum Week {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
}

export interface ShowCadence {
  month: Month
  week: Week
}

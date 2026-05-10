export type SheepPoint = {
  year: number;
  value: number;
};

export type CountrySeries = {
  country: string;
  iso2code: string;
  iso3code: string;
  slug: string;
  pun?: string;
  funFact?: string;
  points: SheepPoint[];
  latestValue: number;
};
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
  description?: string;
  sections?: {
    Overview: string;
    Geography: string;
    History: string;
    Culture: string;
    Economy: string;
    Food: string;
    Tourism: string;
    People: string;
    Nature: string;
    "Fun Facts": string;
  };
  points: SheepPoint[];
  latestValue: number;
};
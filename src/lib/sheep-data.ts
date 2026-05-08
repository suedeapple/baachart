import fs from "node:fs";
import path from "node:path";

import type { CountrySeries } from "@/types/sheep";

type SheepJson = {
  countries?: CountrySeries[];
};

let cachedCountries: CountrySeries[] | null = null;
let cachedBySlug: Map<string, CountrySeries> | null = null;

function ensureDataLoaded(): void {
  if (cachedCountries && cachedBySlug) {
    return;
  }

  const jsonPath = path.join(process.cwd(), "public", "sheep.json");
  const raw = fs.readFileSync(jsonPath, "utf8");
  const parsed = JSON.parse(raw) as SheepJson;
  const countries = parsed.countries ?? [];

  cachedCountries = countries;
  cachedBySlug = new Map(countries.map((country) => [country.slug, country]));
}

export function getAllCountries(): CountrySeries[] {
  ensureDataLoaded();
  return cachedCountries ?? [];
}

export function getCountryBySlug(slug: string): CountrySeries | null {
  ensureDataLoaded();
  return cachedBySlug?.get(slug) ?? null;
}

export function getAllCountrySlugs(): string[] {
  ensureDataLoaded();
  return cachedCountries?.map((country) => country.slug) ?? [];
}
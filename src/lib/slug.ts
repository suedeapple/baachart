export function slugifyCountryName(country: string): string {
  return country
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function dedupeSlugs(countries: string[]): Map<string, string> {
  const sorted = [...countries].sort((a, b) => a.localeCompare(b));
  const slugByCountry = new Map<string, string>();
  const seen = new Map<string, number>();

  for (const country of sorted) {
    const base = slugifyCountryName(country);
    const count = seen.get(base) ?? 0;
    const slug = count === 0 ? base : `${base}-${count + 1}`;

    seen.set(base, count + 1);
    slugByCountry.set(country, slug);
  }

  return slugByCountry;
}
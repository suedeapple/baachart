import CountryGrid from "@/components/CountryGrid";
import { getAllCountries } from "@/lib/sheep-data";

export default function Home() {
  const countries = getAllCountries();
  return <CountryGrid countries={countries} />;
}

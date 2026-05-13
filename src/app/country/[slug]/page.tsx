import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import HeroClouds from "@/components/HeroClouds";
import CtaBand from "@/components/CtaBand";
import SheepChart from "@/components/SheepChart";
import RatioChart from "@/components/RatioChart";
import PieChart from "@/components/PieChart";
import CountryCard from "@/components/CountryCard";
import FaIcon from "@/components/FaIcon";
import { faChartLine, faTable, faShield, faFaceSadTear, faArrowTrendUp, faArrowTrendDown, faScaleBalanced, faPerson, faFileLines, faFaceLaughBeam } from "@fortawesome/free-solid-svg-icons";
import { getAllCountrySlugs, getCountryBySlug, getAllCountries } from "@/lib/sheep-data";

import styles from "./page.module.css";

type CountryPageProps = {
  params: Promise<{ slug: string }>;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 3,
});


export function generateStaticParams() {
  return getAllCountrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return { title: "Country Not Found | BaaChart" };
  return {
    title: `${country.country} Sheep Population 1961–2021 | BaaChart`,
    description: `How many sheep does ${country.country} have? Explore six decades of sheep population data, see how the flock compares to the human population, and track peaks and troughs from 1961 to 2021.`,
  };
}

type WBPoint = { date: string; value: number | null };

async function fetchPopulationByYear(iso3code: string): Promise<Map<number, number | null>> {
  try {
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${iso3code}/indicator/SP.POP.TOTL?format=json&date=1961:2021&per_page=100`
    );
    if (!res.ok) return new Map();
    const json = (await res.json()) as [unknown, WBPoint[]];
    const points = json[1] ?? [];
    return new Map(points.map((p) => [parseInt(p.date, 10), p.value]));
  } catch {
    return new Map();
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const popByYear = await fetchPopulationByYear(country.iso3code);

  const first = country.points[0];
  const last = country.points[country.points.length - 1];
  const delta = last.value - first.value;
  const peakPoint = country.points.reduce((a, b) => (a.value > b.value ? a : b));
  const lowestPoint = country.points.reduce((a, b) => (a.value < b.value ? a : b));
  const latestPop = popByYear.get(last.year) ?? null;

  const ratioByYear = country.points
    .map((p) => { const pop = popByYear.get(p.year); return pop ? { year: p.year, ratio: p.value / pop } : null; })
    .filter((r): r is { year: number; ratio: number } => r !== null);
  const maxRatioPoint = ratioByYear.length > 0 ? ratioByYear.reduce((a, b) => (a.ratio > b.ratio ? a : b)) : null;
  const minRatioPoint = ratioByYear.length > 0 ? ratioByYear.reduce((a, b) => (a.ratio < b.ratio ? a : b)) : null;
  const latestRatio = latestPop != null && latestPop > 0 ? last.value / latestPop : null;
  const deltaPercent = Math.abs(((last.value - first.value) / first.value) * 100).toFixed(0);

  const summaryParts: string[] = [
    `The sheep population of ${country.country} ${delta >= 0 ? "grew" : "fell"} from ${numberFormatter.format(first.value)} in ${first.year} to ${numberFormatter.format(last.value)} in ${last.year} — a ${deltaPercent}% ${delta >= 0 ? "increase" : "decrease"} over six decades.`,
  ];
  if (peakPoint.year !== last.year && peakPoint.value > last.value) {
    summaryParts.push(`The flock peaked at ${numberFormatter.format(peakPoint.value)} in ${peakPoint.year}.`);
  }
  if (latestRatio != null) {
    summaryParts.push(
      latestRatio >= 1
        ? `In ${last.year}, there were ${latestRatio.toFixed(1)} sheep for every person.`
        : `In ${last.year}, there was 1 sheep for every ${(1 / latestRatio).toFixed(1)} people.`
    );
  }
  const summary = summaryParts.join(" ");

  const ratioPoints = country.points.map((p) => ({
    year: p.year,
    sheep: p.value,
    pop: popByYear.get(p.year) ?? null,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.heroWrap}>
        <HeroClouds />
        <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.backLink}>
              <span className={styles.logoBaaBox}>BAA</span>CHART
            </Link>
          </div>
          <header className={styles.header}>
            <Image
              className={styles.flag}
              src={`https://flagcdn.com/256x192/${country.iso2code}.png`}
              alt={`${country.country} flag`}
              width={128}
              height={96}
            />
            <div>
              <h1 className={styles.title}>{country.pun ?? country.iso2code.toUpperCase()}</h1>
              <p className={styles.meta}>{country.country}</p>
            </div>
          </header>
        </div>
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.reportWrap}>
          {/* Left sidebar */}
          <div className={styles.sidePanel}>
            <div className={styles.topStats}>
              <article className={styles.statCard}>
                <div className={styles.iconWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sheep.svg" className={styles.statIcon} alt="" aria-hidden="true" />
                </div>
                <p>{compactFormatter.format(last.value)}</p>
                <span className={styles.statYear}>{last.year}</span>
              </article>
              {latestPop != null && (
                <article className={styles.statCard}>
                  <div className={styles.iconWrap}>
                    <FaIcon icon={faPerson} className={styles.statIconFa} />
                  </div>
                  <p>{compactFormatter.format(latestPop)}</p>
                  <span className={styles.statYear}>{last.year}</span>
                </article>
              )}
              {latestPop != null ? (
                <article className={`${styles.statCard} ${styles.pieCard}`}>
                  <div className={styles.pieWrap}>
                    <PieChart sheep={last.value} pop={latestPop} />
                  </div>
                  <p className={styles.pieLegend}>
                    <span className={styles.pieSheep}>■</span> Sheep
                    {" "}<span className={styles.piePeople}>■</span> People
                  </p>
                </article>
              ) : (
                <article className={`${styles.statCard} ${styles.statCardPlaceholder}`}>
                  <h2>Coming soon</h2>
                  <p>-</p>
                </article>
              )}
              {latestRatio != null && latestRatio >= 1 ? (
                <article className={styles.statCard}>
                  <FaIcon icon={faShield} className={styles.certIcon} />
                  <p className={styles.certText}>Certified More Sheep Than People</p>
                </article>
              ) : (
                <article className={styles.statCard}>
                  <FaIcon icon={faFaceSadTear} className={styles.sadIcon} />
                  <p className={styles.certText}>More People Than Sheep</p>
                </article>
              )}
            </div>

            <section className={styles.stats}>
              <article className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={styles.statRowIconWrap}><FaIcon icon={faArrowTrendUp} className={styles.statRowIcon} /></span>
                  <div>
                    <h2>Highest Sheep Pop.</h2>
                    <p>{compactFormatter.format(peakPoint.value)}</p>
                    <span className={styles.statYear}>{peakPoint.year}</span>
                  </div>
                </div>
              </article>
              <article className={styles.statCard}>
                <div className={styles.statRow}>
                  <span className={styles.statRowIconWrap}><FaIcon icon={faArrowTrendDown} className={styles.statRowIcon} /></span>
                  <div>
                    <h2>Lowest Sheep Pop.</h2>
                    <p>{compactFormatter.format(lowestPoint.value)}</p>
                    <span className={styles.statYear}>{lowestPoint.year}</span>
                  </div>
                </div>
              </article>
              {maxRatioPoint && (
                <article className={styles.statCard}>
                  <div className={styles.statRow}>
                    <span className={styles.statRowIconWrap}><FaIcon icon={faScaleBalanced} className={styles.statRowIcon} /></span>
                    <div>
                      <h2>Max sheep per person</h2>
                      <p>{maxRatioPoint.ratio.toFixed(2)}</p>
                      <span className={styles.statYear}>{maxRatioPoint.year}</span>
                    </div>
                  </div>
                </article>
              )}
              {minRatioPoint && (
                <article className={styles.statCard}>
                  <div className={styles.statRow}>
                    <span className={styles.statRowIconWrap}><FaIcon icon={faScaleBalanced} className={styles.statRowIcon} /></span>
                    <div>
                      <h2>Min sheep per person</h2>
                      <p>{minRatioPoint.ratio.toFixed(2)}</p>
                      <span className={styles.statYear}>{minRatioPoint.year}</span>
                    </div>
                  </div>
                </article>
              )}
            </section>
          </div>

          {/* Right: charts */}
          <div className={styles.chartsPanel}>
            <div className={styles.summaryGrid}>
              <div>
                <div className={styles.summary}>
                  <h3 className={styles.summaryTitle}><span className={styles.tabIconCircle}><FaIcon icon={faFileLines} /></span> Summary</h3>
                  <p>{summary}</p>
                </div>
              </div>
              <div>
                <article className={styles.statCard}>
                  <h3 className={styles.summaryTitle}><span className={styles.tabIconCircle}><FaIcon icon={faFaceLaughBeam} /></span> Fun Sheep Fact</h3>
                  <p className={styles.funFact}>{country.funFact ?? "Fun fact coming soon..."}</p>
                </article>
              </div>
            </div>
            <div className={styles.chartsGrid}>
              <div>
                <h3 className={styles.chartTitle}><FaIcon icon={faChartLine} /> Sheep Population (1961-2021)</h3>
                <SheepChart country={country.country} points={country.points} />
              </div>
              <div>
                <h3 className={styles.chartTitle}><FaIcon icon={faChartLine} /> Sheep &amp; People (% of combined)</h3>
                <RatioChart points={ratioPoints} />
              </div>
            </div>
          </div>

          {/* Full-width table */}
          <div>
          <h3 className={styles.tableTitle}><FaIcon icon={faTable} /> Year by Year</h3>
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Sheep</th>
                  <th>People</th>
                  <th>Sheep per person</th>
                  <th>Persons per sheep</th>
                </tr>
              </thead>
              <tbody>
                {[...country.points].reverse().map((pt) => {
                  const pop = popByYear.get(pt.year);
                  const ratio = pop != null && pop > 0 ? pt.value / pop : null;
                  return (
                    <tr key={pt.year}>
                      <td>{pt.year}</td>
                      <td>
                        <span className={styles.fullNum}>{numberFormatter.format(pt.value)}</span>
                        <span className={styles.compactNum}>{compactFormatter.format(pt.value)}</span>
                      </td>
                      <td>
                        {pop != null ? (
                          <>
                            <span className={styles.fullNum}>{numberFormatter.format(pop)}</span>
                            <span className={styles.compactNum}>{compactFormatter.format(pop)}</span>
                          </>
                        ) : "-"}
                      </td>
                      <td>{ratio != null ? ratio.toFixed(2) : "-"}</td>
                      <td>{ratio != null && ratio > 0 ? (1 / ratio).toFixed(2) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </section>

      </main>

      <div className={styles.randomBand}>
        <svg className={styles.randomWave} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="#9dcf6a" />
        </svg>
        <section className={styles.randomCountries}>
          {(() => {
            const allCountries = getAllCountries();
            const others = allCountries.filter((c) => c.slug !== slug);
            const shuffled = others.sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 6);
            return (
              <div className={styles.randomGrid}>
                {selected.map((c) => (
                  <CountryCard key={c.slug} country={c} />
                ))}
              </div>
            );
          })()}
        </section>
      </div>

      <CtaBand />
    </div>
  );
}

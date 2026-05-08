import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import SheepChart from "@/components/SheepChart";
import CountryCard from "@/components/CountryCard";
import { getAllCountrySlugs, getCountryBySlug, getAllCountries } from "@/lib/sheep-data";

import styles from "./page.module.css";

type CountryPageProps = {
  params: Promise<{ slug: string }>;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function generateStaticParams() {
  return getAllCountrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    return {
      title: "Country Not Found | BaaChart",
    };
  }

  return {
    title: `${country.country} Sheep Population | BaaChart`,
    description: `See ${country.country}'s sheep population history from 1961 to 2021 on BaaChart.`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    notFound();
  }

  const first = country.points[0];
  const last = country.points[country.points.length - 1];
  const delta = last.value - first.value;
  const sectionEntries = Object.entries(country.sections ?? {}).filter(([, value]) => value.trim().length > 0);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.cloud} style={{"--cd": "0s", "--cs": "60s", "--cy": "18%", "--cw": "160px"} as React.CSSProperties} aria-hidden="true" />
        <div className={styles.cloud} style={{"--cd": "18s", "--cs": "50s", "--cy": "55%", "--cw": "100px"} as React.CSSProperties} aria-hidden="true" />
        <div className={styles.cloud} style={{"--cd": "8s", "--cs": "75s", "--cy": "30%", "--cw": "200px"} as React.CSSProperties} aria-hidden="true" />
        <div className={styles.topBar}>
            <Link href="/" className={styles.backLink}>
              <span className={styles.logoBaaBox}>BAA</span>CHART
            </Link>
          </div>
        <div className={styles.heroInner}>
          <header className={styles.header}>
            <Image
              className={styles.flag}
              src={`https://flagcdn.com/256x192/${country.iso2code}.png`}
              alt={`${country.country} flag`}
              width={128}
              height={96}
            />
            <div>
              <h1 className={styles.title}>{country.country}</h1>
              <p className={styles.meta}>{country.pun ?? country.iso2code.toUpperCase()}</p>
            </div>
          </header>
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.chartSection}>
          <h2 className={styles.chartTitle}>Flockulation (1961-2021)</h2>
          <SheepChart country={country.country} points={country.points} />
        </section>

        <section className={styles.stats}>
          <article className={styles.statCard}>
            <h2>1961</h2>
            <p>{numberFormatter.format(first.value)}</p>
          </article>
          <article className={styles.statCard}>
            <h2>2021</h2>
            <p>{numberFormatter.format(last.value)}</p>
          </article>
          <article className={styles.statCard}>
            <h2>Change</h2>
            <p className={delta >= 0 ? styles.gain : styles.loss}>
              {delta >= 0 ? "+" : ""}
              {numberFormatter.format(delta)}
            </p>
          </article>
        </section>

        {sectionEntries.length > 0 && (
          <section className={styles.descriptionSection}>
            <div className={styles.descriptionGrid}>
              {sectionEntries.map(([title, content]) => (
                <article key={title} className={styles.descriptionCard}>
                  <h3 className={styles.descriptionCardTitle}>{title}</h3>
                  <p className={styles.descriptionCardBody}>{content}</p>
                </article>
              ))}
            </div>
          </section>
        )}
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
    </div>
  );
}

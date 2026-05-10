"use client";
import React, { useState } from "react";
import CountryCard from "./CountryCard";
import FaIcon from "./FaIcon";
import HeroClouds from "./HeroClouds";
import CtaBand from "./CtaBand";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { CountrySeries } from "@/types/sheep";
import styles from "@/app/page.module.css";

type Props = {
  countries: CountrySeries[];
};

export default function CountryGrid({ countries }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? countries.filter((c) =>
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  return (
    <div className={styles.page}>
      <div className={styles.heroWrap}>
        <HeroClouds />
        <header className={styles.hero}>
        <h1 className={styles.title}><span className={styles.baaBox}>BAA</span>CHART</h1>
        <div className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <FaIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              className={styles.search}
              type="search"
              placeholder="Search countries…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search countries"
            />
          </div>
        </div>
        </header>
      </div>

      <main className={styles.main}>
        <section className={styles.grid} aria-live="polite">
          {filtered.length > 0 ? (
            filtered.map((country) => (
              <CountryCard key={country.slug} country={country} />
            ))
          ) : (
            <p className={styles.noResults}>No countries match &ldquo;{query}&rdquo;</p>
          )}
        </section>
      </main>

      <CtaBand />
    </div>
  );
}

import React from "react";
import CountryCard from "@/components/CountryCard";
import { getAllCountries } from "@/lib/sheep-data";
import styles from "./page.module.css";

export default function Home() {
  const countries = getAllCountries();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.cloud} style={{"--cd": "0s", "--cs": "60s", "--cy": "18%", "--cw": "160px"} as React.CSSProperties} aria-hidden="true" />
        <div className={styles.cloud} style={{"--cd": "18s", "--cs": "50s", "--cy": "55%", "--cw": "100px"} as React.CSSProperties} aria-hidden="true" />
        <div className={styles.cloud} style={{"--cd": "8s", "--cs": "75s", "--cy": "30%", "--cw": "200px"} as React.CSSProperties} aria-hidden="true" />
        <h1 className={styles.title}><span className={styles.baaBox}>BAA</span>CHART</h1>
        <p className={styles.subtitle}>
          Explore global flock population trends from 1961 to 2021.
        </p>
        <p className={styles.count}>
          Total countries in pasture: <strong>{countries.length}</strong>
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.grid}>
          {countries.map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </section>
      </main>
    </div>
  );
}

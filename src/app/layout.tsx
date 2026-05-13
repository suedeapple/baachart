import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BackToTop from "@/components/BackToTop";
import styles from "./layout.module.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BaaChart – Global Sheep Population Explorer",
  description: "Explore sheep population data for every country from 1961 to 2021. Compare flocks to human populations, track six decades of change, and discover which nations are truly sheep country.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className={styles.shell}>
          <div className={styles.content}>{children}</div>
          <footer className={styles.footer}>
            <svg className={styles.footerWave} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="#5a9e2f" />
            </svg>
            <div className={styles.footerBody}>
              <div className={styles.footerInner}>
                <p className={`${styles.footerSources} ${styles.footerData}`}>Sheep statistics sourced from <a href="https://www.fao.org/faostat/" target="_blank" rel="noopener noreferrer">FAOSTAT</a>. Human population data from the <a href="https://data.worldbank.org/" target="_blank" rel="noopener noreferrer">World Bank</a></p>
                <div className={styles.footerTop}>
                  <p className={styles.footerCopyright}>Copyright (c) {new Date().getFullYear()} BaaChart</p>
                  <p className={styles.footerSources}>Web design by <a href="https://www.suedeapple.co.uk/?utm_source=baachart&utm_medium=referral&utm_campaign=footer_credit" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>suedeapple</a></p>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <BackToTop />
      </body>
    </html>
  );
}

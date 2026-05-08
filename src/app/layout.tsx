import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "BaaChart",
  description: "Country-by-country sheep population explorer from 1961 to 2021.",
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
              <div className={styles.footerInner}>Copyright (c) 2026 BaaChart. All rights reserved.</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import styles from "./Nav.module.css";

const links = [
  { href: "/", label: "Home" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        className={`${styles.hamburger} ${open ? styles.open : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <nav className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.navLink}>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

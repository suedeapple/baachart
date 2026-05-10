"use client";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import FaIcon from "./FaIcon";
import styles from "@/app/layout.module.css";

export default function BackToTop() {
  return (
    <button
      className={styles.backToTop}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FaIcon icon={faChevronUp} />
    </button>
  );
}

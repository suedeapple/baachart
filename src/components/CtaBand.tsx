"use client";
import React, { useState, useCallback, useRef } from "react";
import FaIcon from "./FaIcon";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SheepSvg from "../../public/sheep.svg";
import styles from "./CtaBand.module.css";

gsap.registerPlugin(useGSAP);

const SHEEP_CONFIG = [
  { rotation: 10 },
  { rotation: 16 },
  { rotation: 7  },
  { rotation: 14 },
  { rotation: 11 },
];

function MeadowSheepIcon({ index, rotation }: { index: number; rotation: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = wrapRef.current;
    if (!root) return;

    const face = root.querySelector(".sheep_svg__face");
    if (face) {
      gsap.fromTo(
        face,
        { rotation: -rotation, transformOrigin: "50% 100%" },
        { rotation, transformOrigin: "50% 100%", duration: 2.5 + index * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: index * 0.6 }
      );
    }

    const eyes = root.querySelectorAll(".sheep_svg__left-eye circle, .sheep_svg__right-eye circle");
    if (eyes.length === 0) return;

    gsap.set(eyes, { transformOrigin: "50% 50%", scaleY: 1 });

    gsap.timeline({ repeat: -1, repeatDelay: 2.5 + index * 1.4, delay: index * 0.9 })
      .to(eyes, { scaleY: 0, duration: 0.06, ease: "power2.in" })
      .to(eyes, { scaleY: 1, duration: 0.1,  ease: "power2.out" })
      .to(eyes, { scaleY: 0, duration: 0.06, ease: "power2.in", delay: 0.12 })
      .to(eyes, { scaleY: 1, duration: 0.1,  ease: "power2.out" });
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} style={{ overflow: "visible" }}>
      <SheepSvg className={styles.meadowSheep} aria-hidden="true" />
    </div>
  );
}

export default function CtaBand() {
  const [activeBaa, setActiveBaa] = useState<number | null>(null);

  const triggerBaa = useCallback((i: number) => {
    setActiveBaa(i);
    setTimeout(() => setActiveBaa(null), 1500);
  }, []);

  return (
    <div className={styles.ctaBand}>
      <div className={styles.ctaInner}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaText}>
            <h2 className={styles.ctaHeading}>Join The Social Flock!</h2>
            <p className={styles.ctaSub}>Social media training &amp; consultancy for businesses.</p>
            <p className={styles.ctaCredit}>BaaChart, brought to you in conjunction with <a href="https://socialmediaexec.co.uk/" target="_blank" rel="noopener noreferrer" className={styles.ctaCreditLink}>socialmediaexec.co.uk <FaIcon icon={faArrowUpRightFromSquare} className={styles.ctaUrlIcon} /></a></p>
          </div>
          <a className={styles.ctaBtn} href="https://socialmediaexec.co.uk/" target="_blank" rel="noopener noreferrer">
            Learn more
          </a>
        </div>

        <svg className={styles.ctaHills} viewBox="0 0 1200 130" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,55 C200,10 450,95 700,45 C900,5 1100,65 1200,40 L1200,130 L0,130 Z" fill="#b5e07a" />
          <path d="M0,90 C180,55 420,115 650,80 C880,45 1080,100 1200,75 L1200,130 L0,130 Z" fill="#9dcf6a" />
        </svg>

        <div className={styles.ctaMeadow}>
          {SHEEP_CONFIG.map((cfg, i) => (
            <div
              key={i}
              className={`${styles.sheepWrap} ${styles[`sheep${i + 1}` as keyof typeof styles]}`}
              onClick={() => triggerBaa(i)}
            >
              <MeadowSheepIcon index={i} rotation={cfg.rotation} />
              <span className={`${styles.baaBubble} ${activeBaa === i ? styles.baaVisible : ""}`}>BAA!</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

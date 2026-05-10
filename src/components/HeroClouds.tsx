"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./HeroClouds.module.css";

gsap.registerPlugin(useGSAP);

const CLOUDS = [
  { speed: 60, delay: 0,  top: "18%", width: 160 },
  { speed: 50, delay: 18, top: "55%", width: 100 },
  { speed: 75, delay: 8,  top: "30%", width: 200 },
];

export default function HeroClouds() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const containerWidth = wrapRef.current?.offsetWidth ?? window.innerWidth;

    CLOUDS.forEach((cloud, i) => {
      const el = refs.current[i];
      if (!el) return;

      const start = -(cloud.width + 50);
      const end = containerWidth + cloud.width + 50;

      gsap.set(el, { x: start });

      gsap.fromTo(
        el,
        { x: start },
        { x: end, duration: cloud.speed, ease: "none", repeat: -1, delay: cloud.delay }
      );
    });
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 2 }} aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={styles.cloud}
          style={{ top: cloud.top, width: cloud.width, height: cloud.width * 0.45 }}
        />
      ))}
    </div>
  );
}

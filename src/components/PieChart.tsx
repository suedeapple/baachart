"use client";
import { useState } from "react";
import styles from "./PieChart.module.css";

type Props = { sheep: number; pop: number };

export default function PieChart({ sheep, pop }: Props) {
  const [hovered, setHovered] = useState(false);

  const total = sheep + pop;
  const frac = Math.min(Math.max(sheep / total, 0.001), 0.999);
  const sheepPct = (frac * 100).toFixed(1);
  const peoplePct = ((1 - frac) * 100).toFixed(1);

  const cx = 45;
  const cy = 45;
  const r = 42;
  const startAngle = -Math.PI / 2;
  const splitAngle = startAngle + frac * 2 * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(splitAngle);
  const y2 = cy + r * Math.sin(splitAngle);

  const tipW = 148;
  const tipH = 52;
  const tipX = cx - tipW / 2;
  const tipY = -tipH - 8;

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 90 90"
      aria-hidden="true"
      className={styles.pie}
      style={{ overflow: "visible" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* flipped horizontally so sheep sits on the left */}
      <g transform="scale(-1 1) translate(-90 0)">
        {/* sheep clockwise from top */}
        <path
          d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x2} ${y2}Z`}
          fill="#1a4a8a"
        />
        {/* people fills the rest */}
        <path
          d={`M${cx} ${cy} L${x2} ${y2} A${r} ${r} 0 ${frac <= 0.5 ? 1 : 0} 1 ${x1} ${y1}Z`}
          fill="#4a90e2"
        />
      </g>

      {hovered && (
        <g transform={`translate(${tipX}, ${tipY})`}>
          <rect width={tipW} height={tipH} rx={8} fill="rgba(20,40,15,0.88)" />
          <circle cx={12} cy={18} r={5} fill="#1a4a8a" />
          <text x={22} y={22} className={styles.tipText}>Sheep {sheepPct}%</text>
          <circle cx={12} cy={38} r={5} fill="#4a90e2" />
          <text x={22} y={42} className={styles.tipText}>People {peoplePct}%</text>
        </g>
      )}
    </svg>
  );
}

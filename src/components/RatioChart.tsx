"use client";
import { useState, useRef, useCallback } from "react";
import styles from "./RatioChart.module.css";

export type RatioPoint = {
  year: number;
  sheep: number;
  pop: number | null;
};

type SVGPt = { x: number; y: number };

function buildSmoothPath(pts: SVGPt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M${pts[0].x} ${pts[0].y} L${pts[1].x} ${pts[1].y}`;
  let path = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[i] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

type Computed = { year: number; sheepPct: number; popPct: number };

export default function RatioChart({ points }: { points: RatioPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; year: number; sheepPct: number; popPct: number } | null>(null);

  const W = 980;
  const H = 420;
  const pad = { top: 34, right: 24, bottom: 42, left: 56 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const computed: Computed[] = points
    .filter((p): p is RatioPoint & { pop: number } => p.pop != null && p.pop + p.sheep > 0)
    .map((p) => {
      const total = p.sheep + p.pop;
      return { year: p.year, sheepPct: (p.sheep / total) * 100, popPct: (p.pop / total) * 100 };
    });

  const minYear = computed.length > 0 ? computed[0].year : 1961;
  const maxYear = computed.length > 0 ? computed[computed.length - 1].year : 2021;

  const toX = (yr: number) => pad.left + ((yr - minYear) / (maxYear - minYear || 1)) * plotW;
  const toY = (pct: number) => pad.top + (1 - pct / 100) * plotH;

  const sheepSVG: SVGPt[] = computed.map((p) => ({ x: toX(p.year), y: toY(p.sheepPct) }));
  const popSVG: SVGPt[] = computed.map((p) => ({ x: toX(p.year), y: toY(p.popPct) }));

  const sheepPath = buildSmoothPath(sheepSVG);
  const popPath = buildSmoothPath(popSVG);
  const yTicks = [0, 25, 50, 75, 100];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg || computed.length === 0) return;
      const rect = svg.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) * (W / rect.width);
      const r = Math.max(0, Math.min(1, (svgX - pad.left) / plotW));
      const yr = Math.round(minYear + r * (maxYear - minYear));
      const closest = computed.reduce((b, p) =>
        Math.abs(p.year - yr) < Math.abs(b.year - yr) ? p : b
      );
      setHover({ x: toX(closest.year), year: closest.year, sheepPct: closest.sheepPct, popPct: closest.popPct });
    },
    [computed, minYear, maxYear, plotW]
  );

  if (computed.length < 2) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        role="img"
        aria-label="Sheep vs people as share of combined total"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <rect x="0" y="0" width={W} height={H} fill="#000" />

        {yTicks.map((pct) => {
          const y = toY(pct);
          return (
            <g key={pct}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} className={styles.gridLine} />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className={styles.axisText}>
                {pct}%
              </text>
            </g>
          );
        })}

        <path
          d={`${sheepPath} L${toX(maxYear)} ${toY(0)} L${toX(minYear)} ${toY(0)} Z`}
          fill="rgba(75,139,59,0.12)"
        />
        <path
          d={`${popPath} L${toX(maxYear)} ${toY(0)} L${toX(minYear)} ${toY(0)} Z`}
          fill="rgba(74,144,226,0.12)"
        />

        <path d={sheepPath} className={styles.sheepLine} />
        <path d={popPath} className={styles.popLine} />

        <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} className={styles.axisLine} />
        <text x={pad.left} y={H - 12} className={styles.axisText}>{minYear}</text>
        <text x={W - pad.right} y={H - 12} textAnchor="end" className={styles.axisText}>{maxYear}</text>

        <g transform={`translate(${pad.left}, 14)`}>
          <rect x="0" y="-9" width="12" height="4" rx="2" fill="#4b8b3b" />
          <text x="18" y="0" className={styles.legendText}>Sheep</text>
          <rect x="76" y="-9" width="12" height="4" rx="2" fill="#4a90e2" />
          <text x="94" y="0" className={styles.legendText}>People</text>
        </g>

        {hover && (() => {
          const tipW = 140;
          const tipX = hover.x + 12 + tipW > W - pad.right ? hover.x - tipW - 12 : hover.x + 12;
          const tipY = pad.top + 4;
          return (
            <g>
              <line x1={hover.x} y1={pad.top} x2={hover.x} y2={H - pad.bottom} className={styles.hoverLine} />
              <circle cx={hover.x} cy={toY(hover.sheepPct)} r={5} className={styles.sheepDot} />
              <circle cx={hover.x} cy={toY(hover.popPct)} r={5} className={styles.popDot} />
              <rect x={tipX} y={tipY} width={tipW} height={62} rx={8} className={styles.tooltipBox} />
              <text x={tipX + 10} y={tipY + 17} className={styles.tooltipYear}>{hover.year}</text>
              <text x={tipX + 10} y={tipY + 35} className={styles.tooltipSheep}>
                Sheep {hover.sheepPct.toFixed(1)}%
              </text>
              <text x={tipX + 10} y={tipY + 53} className={styles.tooltipPop}>
                People {hover.popPct.toFixed(1)}%
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

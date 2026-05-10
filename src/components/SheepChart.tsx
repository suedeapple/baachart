"use client";
import { useState, useRef, useCallback } from "react";
import type { SheepPoint } from "@/types/sheep";

import styles from "./SheepChart.module.css";

type SheepChartProps = {
  country: string;
  points: SheepPoint[];
};

type Point = {
  x: number;
  y: number;
};

const valueFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 3,
});

const tooltipFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const only = points[0];
    return `M${only.x} ${only.y}`;
  }

  if (points.length === 2) {
    const [first, second] = points;
    return `M${first.x} ${first.y} L${second.x} ${second.y}`;
  }

  const tension = 1;
  let path = `M${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export default function SheepChart({ country, points }: SheepChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; year: number; value: number } | null>(null);

  const width = 980;
  const height = 420;
  const padding = { top: 74, right: 24, bottom: 42, left: 56 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (points.length < 2) {
    return <p className={styles.empty}>Not enough data points to chart this flock.</p>;
  }

  const years = points.map((point) => point.year);
  const values = points.map((point) => point.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minValue = 0;
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const toX = (year: number) =>
    padding.left + ((year - minYear) / (maxYear - minYear || 1)) * plotWidth;
  const toY = (value: number) =>
    padding.top + (1 - (value - minValue) / valueRange) * plotHeight;

  const chartPoints = points.map((point) => ({
    x: toX(point.year),
    y: toY(point.value),
  }));
  const path = buildSmoothPath(chartPoints);
  const yAxisTicks = 5;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    const ratio = Math.max(0, Math.min(1, (svgX - padding.left) / plotWidth));
    const year = Math.round(minYear + ratio * (maxYear - minYear));
    const closest = points.reduce((best, p) =>
      Math.abs(p.year - year) < Math.abs(best.year - year) ? p : best
    );
    setHover({ x: toX(closest.year), y: toY(closest.value), year: closest.year, value: closest.value });
  }, [points, minYear, maxYear, plotWidth, padding.left, width]);

  const tooltipPad = 10;
  const tooltipW = 160;
  const tooltipH = 62;
  const tooltipX = hover
    ? hover.x + tooltipPad + tooltipW > width - padding.right
      ? hover.x - tooltipW - tooltipPad
      : hover.x + tooltipPad
    : 0;
  const tooltipY = hover ? Math.max(padding.top, hover.y - tooltipH / 2) : 0;

  return (
    <div className={styles.wrap}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.chart}
        role="img"
        aria-label={`${country} sheep population chart`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9dcf6a" />
            <stop offset="65%" stopColor="#b5db8a" />
            <stop offset="100%" stopColor="#c8e8a0" />
          </linearGradient>

          <linearGradient id="fieldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fcf6c" />
            <stop offset="100%" stopColor="#4f9a3d" />
          </linearGradient>

          <linearGradient id="woolGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(86, 179, 75, 0.62)" />
            <stop offset="100%" stopColor="rgba(86, 179, 75, 0.18)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={width} height={height} className={styles.chartBg} />
        <rect x="0" y="0" width={width} height={height} fill="#000" />

        {Array.from({ length: yAxisTicks + 1 }).map((_, index) => {
          const ratio = index / yAxisTicks;
          const value = maxValue - ratio * valueRange;
          const y = padding.top + ratio * plotHeight;

          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className={styles.gridLine}
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className={styles.axisText}>
                {valueFormatter.format(value)}
              </text>
            </g>
          );
        })}

        <path
          d={`${path} L ${toX(maxYear)} ${height - padding.bottom} L ${toX(minYear)} ${height - padding.bottom} Z`}
          fill="rgba(86, 179, 75, 0.45)"
        />
        <path d={path} className={styles.mainPath} />


        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          className={styles.axisLine}
        />
        <text x={padding.left} y={height - 12} className={styles.axisText}>
          {minYear}
        </text>
        <text x={width - padding.right} y={height - 12} textAnchor="end" className={styles.axisText}>
          {maxYear}
        </text>

        {hover && (
          <g className={styles.hoverGroup}>
            <line
              x1={hover.x} y1={padding.top}
              x2={hover.x} y2={height - padding.bottom}
              className={styles.hoverLine}
            />
            <circle cx={hover.x} cy={hover.y} r={6} className={styles.hoverDot} />
            <rect x={tooltipX} y={tooltipY} width={tooltipW} height={tooltipH} rx={8} className={styles.tooltipBox} />
            <text x={tooltipX + 10} y={tooltipY + 17} className={styles.tooltipYear}>{hover.year}</text>
            <text x={tooltipX + 10} y={tooltipY + 33} className={styles.tooltipYear}>Sheep Flockulation</text>
            <text x={tooltipX + 10} y={tooltipY + 52} className={styles.tooltipValue}>{tooltipFormatter.format(hover.value)}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
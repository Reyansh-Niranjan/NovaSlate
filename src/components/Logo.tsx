import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * NovaSlate logo mark — faithful recreation of the geometric folded-N
 * design, re-coloured with the official brand palette:
 *   Left facet  : #1E3A8A (deep navy)
 *   Center blade: #0284C7 (sky blue) → #38BDF8 (light sky)
 *   Right facet : #F97316 (brand orange) tinted down to a warm mid
 *
 * The mark matches the 3-facet folded-N geometry from the reference design.
 */
export default function Logo({ className = "w-7 h-7", size, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      aria-label="NovaSlate Logo"
      role="img"
      {...props}
    >
      <defs>
        {/* Left facet: deep navy → royal blue */}
        <linearGradient id="ns-left" x1="10" y1="14" x2="32" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Center diagonal blade: sky blue → light sky */}
        <linearGradient id="ns-center" x1="22" y1="14" x2="58" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Right facet: warm orange (brand accent) */}
        <linearGradient id="ns-right" x1="48" y1="14" x2="70" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/*
        ─────────────────────────────────────────────────────────────────
        LEFT FACET  — tall parallelogram, leans right at top
        Maps to the purple/indigo piece in the reference design
        ─────────────────────────────────────────────────────────────────
      */}
      <path
        d="M10 66 L10 28 L32 14 L32 52 Z"
        fill="url(#ns-left)"
      />

      {/*
        ─────────────────────────────────────────────────────────────────
        CENTER DIAGONAL BLADE  — thin parallelogram running top-left
        to bottom-right (the crossbar of the N)
        Maps to the teal/mint piece in the reference
        ─────────────────────────────────────────────────────────────────
      */}
      <path
        d="M32 14 L58 52 L48 66 L22 28 Z"
        fill="url(#ns-center)"
      />

      {/*
        ─────────────────────────────────────────────────────────────────
        RIGHT FACET  — tall parallelogram, mirror of left
        Maps to the green piece in the reference; we use brand orange
        ─────────────────────────────────────────────────────────────────
      */}
      <path
        d="M48 14 L70 14 L70 52 L48 66 Z"
        fill="url(#ns-right)"
      />
    </svg>
  );
}

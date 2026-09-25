import { memo } from "react";

/**
 * 1. Bar Chart Scrubber (Behind the 'L' and bars of 'Learn')
 * Displays animated vertical data bars with a floating percentage scrubber handle [31% | ◀ ▶]
 * and vertical dashed reference plumb line.
 */
export const BarChartScrubber = memo(function BarChartScrubber() {
  const bars = [
    { height: "42%", delay: "0s" },
    { height: "68%", delay: "0.2s" },
    { height: "92%", delay: "0.4s" },
    { height: "52%", delay: "0.1s" },
    { height: "76%", delay: "0.3s" },
  ];

  return (
    <div
      className="absolute top-2 sm:top-4 -left-6 sm:-left-10 z-0 pointer-events-none select-none flex items-end gap-1.5 sm:gap-2.5 h-20 sm:h-28 opacity-85"
      aria-hidden="true"
    >
      {/* Vertical Dashed Target Plumb Line */}
      <div className="absolute left-[38%] sm:left-[40%] -top-4 bottom-0 w-[1.5px] border-l-2 border-dashed border-primary/45 z-0 animate-pulse" />

      {/* Floating Scrubber Handle Badge: [31% | ◀ ▶] */}
      <div className="absolute left-[38%] sm:left-[40%] -top-6 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce-subtle">
        <div className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-mono text-[9.5px] sm:text-[10.5px] font-bold tracking-tight shadow-md flex items-center gap-1 border border-primary/20">
          <span>31%</span>
        </div>
        <div className="w-4.5 h-4.5 -mt-0.5 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-[7.5px] text-muted-foreground">
          <span>◀▶</span>
        </div>
      </div>

      {/* Animated Data Bars */}
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-2.5 sm:w-3.5 rounded-t-md bg-primary/20 dark:bg-primary/25 border-t border-x border-primary/30 origin-bottom transition-all"
          style={{
            height: bar.height,
            animation: `barBreathe 3.5s ease-in-out infinite alternate ${bar.delay}`,
          }}
        />
      ))}
    </div>
  );
});

/**
 * 2. Logic Block Stack (Nestled in the center between Line 1 and Line 2)
 * Authentic Blockly / Scratch interlocking code logic chips:
 * [ 🔄 while learning ▾ ]
 * [   if curious ▾      ]
 * [     ✦ keep growing  ]
 * [   else              ]
 * [     turn_page()     ]
 */
export const LogicBlockStack = memo(function LogicBlockStack() {
  return (
    <div
      className="relative z-10 select-none flex flex-col gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-[11.5px] tracking-tight animate-float-subtle"
      aria-hidden="true"
    >
      {/* Top block: while learning */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/95 dark:bg-card/90 border border-border shadow-xs backdrop-blur-xs text-muted-foreground w-fit">
        <span className="text-primary font-bold">↻ while</span>
        <span className="text-foreground font-semibold">learning</span>
        <span className="text-[9px] text-muted-foreground/70">▾</span>
      </div>

      {/* Nested block: if curious */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/95 dark:bg-card/90 border border-border shadow-xs backdrop-blur-xs text-muted-foreground ml-3 sm:ml-4 w-fit">
        <span className="text-amber-500 font-bold">if</span>
        <span className="text-foreground font-semibold">curious</span>
        <span className="text-[9px] text-muted-foreground/70">▾</span>
      </div>

      {/* Active action block: keep growing (Vibrant Cerulean Pill) */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md ml-6 sm:ml-8 w-fit border border-primary/30 transform -rotate-1 hover:rotate-0 transition-transform">
        <span>✦</span>
        <span>keep growing</span>
        <span className="text-[9px] opacity-80">▾</span>
      </div>

      {/* Else fallback */}
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground ml-3 sm:ml-4 w-fit text-[9px] sm:text-[10px]">
        <span>else</span>
      </div>

      {/* Final leaf call */}
      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-card/80 border border-border/80 text-muted-foreground ml-6 sm:ml-8 w-fit text-[9px] sm:text-[10.5px]">
        <span className="text-primary font-semibold">turn_page</span>
        <span>()</span>
      </div>
    </div>
  );
});

/**
 * 3. Physics Particle Cloud & Elastic Tether (Top Right of 'Learn')
 * Tethered amber attractor node with 17 orbiting, scattering kinetic particles.
 */
export const PhysicsParticleCloud = memo(function PhysicsParticleCloud() {
  const particles = [
    { x: 50, y: 12, r: 2.2, color: "#E4B34C", delay: "0s" },
    { x: 62, y: 8, r: 1.8, color: "#E4B34C", delay: "0.4s" },
    { x: 74, y: 18, r: 2.5, color: "#1883B1", delay: "0.2s" },
    { x: 85, y: 14, r: 1.5, color: "#E4B34C", delay: "0.6s" },
    { x: 92, y: 26, r: 2.8, color: "#E4B34C", delay: "0.1s" },
    { x: 80, y: 34, r: 2.0, color: "#1883B1", delay: "0.5s" },
    { x: 95, y: 42, r: 1.6, color: "#E4B34C", delay: "0.7s" },
    { x: 104, y: 22, r: 2.2, color: "#E4B34C", delay: "0.3s" },
    { x: 112, y: 36, r: 1.4, color: "#1883B1", delay: "0.8s" },
    { x: 68, y: 28, r: 2.0, color: "#E4B34C", delay: "0.5s" },
    { x: 58, y: 40, r: 1.6, color: "#E4B34C", delay: "0.2s" },
    { x: 45, y: 24, r: 2.4, color: "#1883B1", delay: "0.9s" },
    { x: 76, y: 46, r: 1.7, color: "#E4B34C", delay: "0.3s" },
    { x: 88, y: 52, r: 2.3, color: "#E4B34C", delay: "0.1s" },
    { x: 102, y: 50, r: 1.5, color: "#1883B1", delay: "0.6s" },
    { x: 118, y: 44, r: 2.1, color: "#E4B34C", delay: "0.4s" },
    { x: 125, y: 32, r: 1.6, color: "#E4B34C", delay: "0.7s" },
  ];

  return (
    <div
      className="absolute -top-4 sm:-top-8 -right-8 sm:-right-18 z-0 pointer-events-none select-none w-40 sm:w-56 h-26 sm:h-36"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 140 70"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Elastic Tether Connector Line */}
        <line
          x1="12"
          y1="38"
          x2="48"
          y2="38"
          stroke="#E4B34C"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="3 3"
          className="opacity-90"
        />

        {/* Anchor Pivot Pin */}
        <circle cx="12" cy="38" r="3.5" fill="var(--foreground)" />

        {/* Primary Attractor Node (Amber) */}
        <circle
          cx="48"
          cy="38"
          r="8"
          fill="#E4B34C"
          className="animate-pulse-subtle shadow-md"
        />
        <circle cx="48" cy="38" r="3" fill="#FFFFFF" />

        {/* Floating Kinetic Particle Cloud */}
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.color}
            className="opacity-85"
            style={{
              animation: `particleJitter 4s ease-in-out infinite alternate ${p.delay}`,
            }}
          />
        ))}
      </svg>
    </div>
  );
});

/**
 * 4. Calculus Sine Wave & Draggable/Oscillating Coordinate Node (Lower Right)
 * Traverses a mathematical sine curve with dynamic vertical plumb line.
 */
export const CalculusWaveNode = memo(function CalculusWaveNode() {
  return (
    <div
      className="absolute -bottom-4 sm:-bottom-6 right-0 sm:right-2 z-10 pointer-events-none select-none w-36 sm:w-48 h-20 sm:h-24"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 80"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mathematical Sine Curve */}
        <path
          d="M 10 50 C 40 10, 70 80, 100 40 C 130 0, 150 50, 160 50"
          stroke="var(--ns-navy)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-75 dark:opacity-85"
        />

        {/* Baseline Axis */}
        <line
          x1="0"
          y1="50"
          x2="160"
          y2="50"
          stroke="var(--border)"
          strokeWidth="1.25"
          strokeDasharray="2 2"
        />

        {/* Oscillating Coordinate Node Group */}
        <g className="animate-wave-node">
          {/* Vertical Dashed Drop Plumb Line */}
          <line
            x1="100"
            y1="40"
            x2="100"
            y2="75"
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-90"
          />

          {/* Coordinate Orb Ring & Center */}
          <circle
            cx="100"
            cy="40"
            r="12"
            fill="var(--primary)"
            fillOpacity="0.22"
            className="animate-ping-slow"
          />
          <circle
            cx="100"
            cy="40"
            r="7"
            fill="var(--primary)"
            stroke="var(--background)"
            strokeWidth="2"
          />
          <circle cx="100" cy="40" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
});

/**
 * 5. Horizontal Coordinate / Number Line Axis
 * Precision mathematical ticks and arrow running right through the words.
 */
export const CoordinateAxis = memo(function CoordinateAxis({
  className = "",
  ticks = 11,
}: {
  className?: string;
  ticks?: number;
}) {
  return (
    <div
      className={`relative w-full flex items-center pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Horizontal Axis Hairline */}
      <div className="w-full h-[1.5px] bg-foreground/25 dark:bg-foreground/20" />

      {/* Axis Tick Marks along the line */}
      <div className="absolute inset-0 flex justify-between items-center px-2 sm:px-6">
        {Array.from({ length: ticks }).map((_, i) => (
          <div
            key={i}
            className={`w-[1.25px] bg-foreground/45 dark:bg-foreground/35 ${
              i % 2 === 0 ? "h-3.5" : "h-2"
            }`}
          />
        ))}
      </div>

      {/* Axis Terminal Arrow */}
      <div className="absolute -right-1 text-foreground/50 dark:text-foreground/40 text-[11px] font-mono leading-none">
        ▶
      </div>
    </div>
  );
});

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const baseSize = 80;
const stepSize = 40;
const maxPasses = 2;
const numColors = 5;
const pr = 1.5;
const hr = 0.05;
const SVG_NS = 'http://www.w3.org/2000/svg';

const colors = ['#1883B1', '#629BB5', '#D2475F', '#DE6D80', '#EBA0AD'];

function fmt(n: number) {
  return Number(n).toFixed(2);
}

function calcSize(lvl: number) {
  return lvl < 0 ? 0 : baseSize + lvl * stepSize;
}

export const ExperienceAsset: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const g = gRef.current;
    if (!container || !svg || !g) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let maxLevel = 0;
    let nextColorIdx = 0;
    let duration = 0;

    const data = {
      el: [] as SVGRectElement[],
      level: [] as number[],
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
    };

    const build = () => {
      if (!width || !height) return;
      g.innerHTML = '';
      data.el.length = 0;
      data.level.length = 0;

      svg.setAttribute('viewBox', `0 0 ${fmt(width)} ${fmt(height)}`);
      const maxDim = Math.max(width, height);
      g.setAttribute('transform', `rotate(45, ${fmt(centerX)}, ${fmt(centerY)})`);

      maxLevel = 0;
      let passes = 0;
      for (; passes < maxPasses && (maxLevel++, calcSize(maxLevel) * Math.SQRT2 >= maxDim && passes++, !(maxLevel > 200)); );
      nextColorIdx = (maxLevel + 1) % numColors;

      const rects: SVGRectElement[] = new Array(maxLevel + 1);
      for (let L = maxLevel; L >= 0; L--) {
        const sz = calcSize(L);
        const color = colors[L % numColors];
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', fmt(centerX - sz / 2));
        rect.setAttribute('y', fmt(centerY - sz / 2));
        rect.setAttribute('width', fmt(sz));
        rect.setAttribute('height', fmt(sz));
        rect.setAttribute('fill', color);
        g.appendChild(rect);
        rects[L] = rect;
      }

      // Center seed rectangle (size 0)
      const seed = document.createElementNS(SVG_NS, 'rect');
      seed.setAttribute('x', fmt(centerX));
      seed.setAttribute('y', fmt(centerY));
      seed.setAttribute('width', fmt(0));
      seed.setAttribute('height', fmt(0));
      seed.setAttribute('fill', colors[nextColorIdx]);
      g.appendChild(seed);

      for (let L = 0; L <= maxLevel; L++) {
        data.el.push(rects[L]);
        data.level.push(L);
      }
      data.el.push(seed);
      data.level.push(-1);

      duration = pr + (maxLevel - 1) * hr;
    };

    const animateStep = () => {
      if (!data.el.length) return;

      data.el.forEach((rect, i) => {
        const lvl = data.level[i];
        if (lvl === maxLevel) return;

        const currentSz = calcSize(lvl);
        const targetSz = calcSize(lvl + 1);
        const delay = lvl < 0 ? 0 : lvl * hr;
        const proxy = { w: currentSz, h: currentSz };

        gsap.to(proxy, {
          h: targetSz,
          duration: pr,
          delay,
          ease: 'backExpoInOut',
          onUpdate() {
            const h = Math.max(0, proxy.h);
            rect.setAttribute('y', fmt(centerY - h / 2));
            rect.setAttribute('height', fmt(h));
          },
        });

        gsap.to(proxy, {
          w: targetSz,
          duration: pr * 0.7,
          delay,
          ease: 'backExpoInOut',
          onUpdate() {
            const w = Math.max(0, proxy.w);
            rect.setAttribute('x', fmt(centerX - w / 2));
            rect.setAttribute('width', fmt(w));
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.el);
      const maxIdx = data.level.findIndex((lvl) => lvl === maxLevel);

      for (let i = 0; i < data.level.length; i++) {
        if (i !== maxIdx) data.level[i]++;
      }

      if (maxIdx !== -1) {
        nextColorIdx = (nextColorIdx + 1) % numColors;
        data.level[maxIdx] = -1;
        const recycled = data.el[maxIdx];
        recycled.setAttribute('x', fmt(centerX));
        recycled.setAttribute('y', fmt(centerY));
        recycled.setAttribute('width', fmt(0));
        recycled.setAttribute('height', fmt(0));
        recycled.setAttribute('fill', colors[nextColorIdx]);
        g.appendChild(recycled);
      }

      animateStep();
    };

    measure();
    build();
    animateStep();

    const runner = registerUspAsset(duration, onCycle);

    const handleResize = () => {
      gsap.killTweensOf(data.el);
      measure();
      build();
      runner.updateDuration(duration);
      animateStep();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gsap.killTweensOf(data.el);
      runner.unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="b-usp-asset-experience absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <svg ref={svgRef} className="b__svg block w-full h-full overflow-hidden" xmlns={SVG_NS}>
        <g ref={gRef} className="b__svg__rects" />
      </svg>
    </div>
  );
};

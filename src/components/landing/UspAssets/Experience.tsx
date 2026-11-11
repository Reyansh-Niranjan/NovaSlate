import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const baseSize = 80;
const stepSize = 40;
const maxPasses = 2;
const numColors = 5;
const pr = 1.5;
const hr = 0.05;

const colors = ['#1883B1', '#629BB5', '#D2475F', '#DE6D80', '#EBA0AD'];

function calcSize(lvl: number) {
  return lvl < 0 ? 0 : baseSize + lvl * stepSize;
}

interface ExpItem {
  w: number;
  h: number;
  color: string;
}

export const ExperienceAsset: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let maxLevel = 0;
    let nextColorIdx = 0;
    let duration = 0;
    const dpr = window.devicePixelRatio || 1;

    const data = {
      items: [] as ExpItem[],
      level: [] as number[],
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const render = () => {
      if (!ctx || !width || !height) return;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.translate(centerX, centerY);
      ctx.rotate(Math.PI / 4);
      ctx.translate(-centerX, -centerY);

      // Draw from largest to smallest (seed last on top)
      for (let L = maxLevel; L >= -1; L--) {
        const idx = data.level.indexOf(L);
        if (idx === -1) continue;
        const item = data.items[idx];
        if (!item || item.w <= 0 || item.h <= 0) continue;
        ctx.fillStyle = item.color;
        ctx.fillRect(centerX - item.w / 2, centerY - item.h / 2, item.w, item.h);
      }
      ctx.restore();
    };

    const build = () => {
      if (!width || !height) return;
      data.items.length = 0;
      data.level.length = 0;

      const maxDim = Math.max(width, height);
      maxLevel = 0;
      let passes = 0;
      for (; passes < maxPasses && (maxLevel++, calcSize(maxLevel) * Math.SQRT2 >= maxDim && passes++, !(maxLevel > 200)); );
      nextColorIdx = (maxLevel + 1) % numColors;

      for (let L = 0; L <= maxLevel; L++) {
        const sz = calcSize(L);
        data.items.push({
          w: sz,
          h: sz,
          color: colors[L % numColors],
        });
        data.level.push(L);
      }

      // Seed
      data.items.push({
        w: 0,
        h: 0,
        color: colors[nextColorIdx],
      });
      data.level.push(-1);

      duration = pr + (maxLevel - 1) * hr;
      render();
    };

    const animateStep = () => {
      if (!data.items.length) return;

      data.items.forEach((item, i) => {
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
            item.h = Math.max(0, proxy.h);
            render();
          },
        });

        gsap.to(proxy, {
          w: targetSz,
          duration: pr * 0.7,
          delay,
          ease: 'backExpoInOut',
          onUpdate() {
            item.w = Math.max(0, proxy.w);
            render();
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.items);
      const maxIdx = data.level.findIndex((lvl) => lvl === maxLevel);

      for (let i = 0; i < data.level.length; i++) {
        if (i !== maxIdx) data.level[i]++;
      }

      if (maxIdx !== -1) {
        nextColorIdx = (nextColorIdx + 1) % numColors;
        data.level[maxIdx] = -1;
        const recycled = data.items[maxIdx];
        recycled.w = 0;
        recycled.h = 0;
        recycled.color = colors[nextColorIdx];
      }

      render();
      animateStep();
    };

    measure();
    build();
    animateStep();

    const runner = registerUspAsset(duration, onCycle);

    const handleResize = () => {
      gsap.killTweensOf(data.items);
      measure();
      build();
      runner.updateDuration(duration);
      animateStep();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gsap.killTweensOf(data.items);
      runner.unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="b-usp-asset-experience absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <canvas ref={canvasRef} className="b__svg block w-full h-full overflow-hidden" />
    </div>
  );
};

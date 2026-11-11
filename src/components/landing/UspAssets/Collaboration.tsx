import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const circleRadius = 80;
const numColors = 5;
const dr = 1.5;
const fr = 0.05;

const colors = ['#1883B1', '#3296BE', '#5CAECF', '#88A9B6', '#B7CAD0'];

export const CollaborationAsset: React.FC = () => {
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
    let cycleCount = 0;
    let duration = 0;
    const dpr = window.devicePixelRatio || 1;

    const data = {
      cx: [] as number[],
      initialCx: [] as number[],
      proxy: [] as { cx: number }[],
      colors: [] as string[],
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const render = () => {
      if (!ctx || !width || !height) return;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const cy = height / 2;
      for (let i = 0; i < data.proxy.length; i++) {
        const x = data.proxy[i]?.cx ?? data.cx[i];
        ctx.fillStyle = data.colors[i];
        ctx.beginPath();
        ctx.arc(x, cy, circleRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const build = () => {
      if (!width || !height) return;
      data.cx.length = 0;
      data.initialCx.length = 0;
      data.proxy.length = 0;
      data.colors.length = 0;
      cycleCount = 0;

      const count = Math.ceil((width + circleRadius) / circleRadius) + 1 + numColors;
      const startX = width - (count - 1) * circleRadius;

      for (let b = 0; b < count; b++) {
        const posX = startX + b * circleRadius;
        const colorIdx = b % numColors;
        data.cx.push(posX);
        data.initialCx.push(posX);
        data.proxy.push({ cx: posX });
        data.colors.push(colors[colorIdx]);
      }

      duration = dr + (data.cx.length - 1) * fr;
      render();
    };

    const animateStep = () => {
      const count = data.cx.length;
      if (!count) return;

      data.proxy.forEach((proxy, i) => {
        gsap.to(proxy, {
          cx: proxy.cx + circleRadius,
          duration: dr,
          delay: (count - i) * fr,
          ease: 'backExpoInOut',
          onUpdate() {
            render();
          },
          onComplete() {
            data.cx[i] = proxy.cx;
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.proxy);
      cycleCount++;
      if (cycleCount >= numColors) {
        cycleCount = 0;
        data.proxy.forEach((proxy, i) => {
          data.cx[i] = data.initialCx[i];
          proxy.cx = data.initialCx[i];
        });
      }
      render();
      animateStep();
    };

    measure();
    build();
    animateStep();

    const runner = registerUspAsset(duration, onCycle);

    const handleResize = () => {
      gsap.killTweensOf(data.proxy);
      measure();
      build();
      runner.updateDuration(duration);
      animateStep();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      gsap.killTweensOf(data.proxy);
      runner.unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="b-usp-asset-collaboration absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <canvas ref={canvasRef} className="b__svg block w-full h-full overflow-hidden" />
    </div>
  );
};

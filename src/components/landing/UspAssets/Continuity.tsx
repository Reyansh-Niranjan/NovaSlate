import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const Qn = 100;
const Dt = 25;
const rr = 5;
const Kn = 5;
const or = 1.5;
const lr = 0.05;

const colors = ['#1883B1', '#2898C7', '#58B0D3', '#88A9B6', '#B2CAD2'];

export const ContinuityAsset: React.FC = () => {
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
    let duration = 0;
    let offsetX = 0;
    let offsetY = 0;
    const dpr = window.devicePixelRatio || 1;

    const data = {
      proxy: [] as { ox: number; oy: number }[],
      x: [] as number[],
      y: [] as number[],
      offsetX: [] as number[],
      offsetY: [] as number[],
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
      ctx.translate(offsetX, offsetY);

      for (let i = 0; i < data.x.length; i++) {
        const x = data.x[i] + (data.proxy[i]?.ox ?? 0);
        const y = data.y[i] + (data.proxy[i]?.oy ?? 0);
        ctx.fillStyle = data.colors[i];
        ctx.fillRect(x, y, Qn, Qn);
      }
      ctx.restore();
    };

    const build = () => {
      if (!width || !height) return;
      data.proxy.length = 0;
      data.x.length = 0;
      data.y.length = 0;
      data.offsetX.length = 0;
      data.offsetY.length = 0;
      data.colors.length = 0;

      const S = Math.max(Math.ceil((width - Qn) / Dt) + 1, Math.ceil((height - Qn) / Dt) + 1);
      const totalSpan = (S - 1) * Dt + Qn;
      offsetX = (width - totalSpan) / 2;
      offsetY = (height - totalSpan) / 2;

      for (let v = -rr; v <= S; v++) {
        const color = colors[((v % Kn) + Kn) % Kn];
        data.proxy.push({ ox: 0, oy: 0 });
        data.x.push(v * Dt);
        data.y.push(v * Dt);
        data.offsetX.push(0);
        data.offsetY.push(0);
        data.colors.push(color);
      }

      duration = or + (data.x.length - 1) * lr;
      render();
    };

    const animateStep = () => {
      const count = data.x.length;
      if (!count) return;
      const R = Dt * rr;

      data.x.forEach((_, i) => {
        const p = data.proxy[i];
        p.ox = data.offsetX[i];
        p.oy = data.offsetY[i];
        const nextOx = p.ox + Dt;
        const nextOy = p.oy + Dt;

        gsap.to(p, {
          ox: nextOx,
          oy: nextOy,
          duration: or,
          delay: (count - i) * lr,
          ease: 'backExpoInOut',
          onUpdate() {
            if (data.x[i] != null) {
              data.offsetX[i] = p.ox;
              data.offsetY[i] = p.oy;
            }
            render();
          },
          onComplete() {
            if (data.offsetX[i] != null) {
              data.offsetX[i] = nextOx % R;
              data.offsetY[i] = nextOy % R;
            }
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.proxy);
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
    <div ref={containerRef} className="b-usp-asset-continuity absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <canvas ref={canvasRef} className="b__svg block w-full h-full overflow-hidden" />
    </div>
  );
};

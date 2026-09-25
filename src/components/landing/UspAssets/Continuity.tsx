import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const Qn = 100;
const Dt = 25;
const rr = 5;
const Kn = 5;
const or = 1.5;
const lr = 0.05;
const SVG_NS = 'http://www.w3.org/2000/svg';

const colors = ['#1883B1', '#2898C7', '#58B0D3', '#88A9B6', '#B2CAD2'];

function fmt(n: number) {
  return Number(n).toFixed(2);
}

export const ContinuityAsset: React.FC = () => {
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
    let duration = 0;

    const data = {
      el: [] as SVGRectElement[],
      proxy: [] as { ox: number; oy: number }[],
      x: [] as number[],
      y: [] as number[],
      offsetX: [] as number[],
      offsetY: [] as number[],
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    };

    const build = () => {
      if (!width || !height) return;
      g.innerHTML = '';
      data.el.length = 0;
      data.proxy.length = 0;
      data.x.length = 0;
      data.y.length = 0;
      data.offsetX.length = 0;
      data.offsetY.length = 0;

      svg.setAttribute('viewBox', `0 0 ${fmt(width)} ${fmt(height)}`);
      const S = Math.max(Math.ceil((width - Qn) / Dt) + 1, Math.ceil((height - Qn) / Dt) + 1);
      const totalSpan = (S - 1) * Dt + Qn;
      const offsetX = (width - totalSpan) / 2;
      const offsetY = (height - totalSpan) / 2;
      g.setAttribute('transform', `translate(${fmt(offsetX)}, ${fmt(offsetY)})`);

      for (let v = -rr; v <= S; v++) {
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', fmt(v * Dt));
        rect.setAttribute('y', fmt(v * Dt));
        rect.setAttribute('width', fmt(Qn));
        rect.setAttribute('height', fmt(Qn));
        const color = colors[((v % Kn) + Kn) % Kn];
        rect.setAttribute('fill', color);
        g.appendChild(rect);

        data.el.push(rect);
        data.proxy.push({ ox: 0, oy: 0 });
        data.x.push(v * Dt);
        data.y.push(v * Dt);
        data.offsetX.push(0);
        data.offsetY.push(0);
      }

      duration = or + (data.el.length - 1) * lr;
    };

    const animateStep = () => {
      const count = data.el.length;
      if (!count) return;
      const R = Dt * rr;

      data.el.forEach((rect, i) => {
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
              rect.setAttribute('x', fmt(data.x[i] + p.ox));
              rect.setAttribute('y', fmt(data.y[i] + p.oy));
            }
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
      <svg ref={svgRef} className="b__svg block w-full h-full overflow-hidden" xmlns={SVG_NS}>
        <g ref={gRef} className="b__svg__squares" />
      </svg>
    </div>
  );
};

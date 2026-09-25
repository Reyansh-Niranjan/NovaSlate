import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const circleRadius = 80;
const numColors = 5;
const dr = 1.5;
const fr = 0.05;
const SVG_NS = 'http://www.w3.org/2000/svg';

const colors = ['#1883B1', '#3296BE', '#5CAECF', '#88A9B6', '#B7CAD0'];

function fmt(n: number) {
  return Number(n).toFixed(2);
}

export const CollaborationAsset: React.FC = () => {
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
    let cycleCount = 0;
    let duration = 0;

    const data = {
      el: [] as SVGCircleElement[],
      cx: [] as number[],
      initialCx: [] as number[],
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
      data.cx.length = 0;
      data.initialCx.length = 0;
      cycleCount = 0;

      svg.setAttribute('viewBox', `0 0 ${fmt(width)} ${fmt(height)}`);
      const cy = height / 2;
      const count = Math.ceil((width + circleRadius) / circleRadius) + 1 + numColors;
      const startX = width - (count - 1) * circleRadius;

      for (let b = 0; b < count; b++) {
        const posX = startX + b * circleRadius;
        const colorIdx = b % numColors;
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', fmt(posX));
        circle.setAttribute('cy', fmt(cy));
        circle.setAttribute('r', fmt(circleRadius));
        circle.setAttribute('fill', colors[colorIdx]);
        g.appendChild(circle);

        data.el.push(circle);
        data.cx.push(posX);
        data.initialCx.push(posX);
      }

      duration = dr + (data.el.length - 1) * fr;
    };

    const animateStep = () => {
      const count = data.el.length;
      if (!count) return;

      data.el.forEach((circle, i) => {
        const proxy = { cx: data.cx[i] };
        gsap.to(proxy, {
          cx: proxy.cx + circleRadius,
          duration: dr,
          delay: (count - i) * fr,
          ease: 'backExpoInOut',
          onUpdate() {
            circle.setAttribute('cx', fmt(proxy.cx));
          },
          onComplete() {
            data.cx[i] = proxy.cx;
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.el);
      cycleCount++;
      if (cycleCount >= numColors) {
        cycleCount = 0;
        data.el.forEach((circle, i) => {
          data.cx[i] = data.initialCx[i];
          circle.setAttribute('cx', fmt(data.initialCx[i]));
        });
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
    <div ref={containerRef} className="b-usp-asset-collaboration absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <svg ref={svgRef} className="b__svg block w-full h-full overflow-hidden" xmlns={SVG_NS}>
        <g ref={gRef} className="b__svg__circles" />
      </svg>
    </div>
  );
};

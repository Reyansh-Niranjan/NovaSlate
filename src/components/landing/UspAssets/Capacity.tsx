import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { registerUspAsset } from './syncRunner';

const xl = 100;
const ar = 100;
const _l = 30;
const Al = 15;
const Sl = 30;
const kl = 4;
const Ut = 5;
const cr = 1.5;
const ur = 0.025;
const SVG_NS = 'http://www.w3.org/2000/svg';

const colors = ['#1883B1', '#47A2C6', '#E4B34C', '#EBC36F', '#F3D698'];

function fmt(n: number) {
  return Number(n).toFixed(2);
}

export const CapacityAsset: React.FC = () => {
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
    let a = 0;
    let d = 0;
    let duration = 0;

    const data = {
      el: [] as SVGRectElement[],
      level: [] as number[],
    };

    function p(v: number) {
      return ar - Al * Math.sqrt(v);
    }
    function u(v: number) {
      let C = height - ar / 2;
      for (let M = 1; M <= v; M++) C += Sl - p(M);
      return C;
    }
    function barWidth(v: number) {
      return xl + v * _l;
    }
    function barX(v: number) {
      return (width - barWidth(v)) / 2;
    }

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    };

    const build = () => {
      if (!width || !height) return;
      g.innerHTML = '';
      data.el.length = 0;
      data.level.length = 0;

      svg.setAttribute('viewBox', `0 0 ${fmt(width)} ${fmt(height)}`);
      a = 0;
      let M = 0;
      for (; M < kl && (a++, u(a) < 0 && M++, !(a > 200)); );
      d = ((a - 1) % Ut + Ut) % Ut;

      const rects: SVGRectElement[] = new Array(a + 1);
      for (let b = a; b >= 0; b--) {
        const L = ((b - 1) % Ut + Ut) % Ut;
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x', fmt(barX(b)));
        rect.setAttribute('y', fmt(u(b)));
        rect.setAttribute('width', fmt(barWidth(b)));
        rect.setAttribute('height', fmt(p(b)));
        rect.setAttribute('fill', colors[L]);
        g.appendChild(rect);
        rects[b] = rect;
      }

      for (let b = 0; b <= a; b++) {
        data.el.push(rects[b]);
        data.level.push(b);
      }

      duration = cr + a * ur;
    };

    const animateStep = () => {
      if (!data.el.length) return;
      data.el.forEach((rect, b) => {
        const lvl = data.level[b];
        const delay = lvl * ur;
        const H = { y: u(lvl), h: p(lvl), w: barWidth(lvl) };

        if (lvl === 0) {
          gsap.to(H, {
            y: height + p(0),
            duration: cr,
            delay,
            ease: 'backExpoInOut',
            onUpdate() {
              rect.setAttribute('y', fmt(H.y));
            },
          });
          return;
        }

        gsap.to(H, {
          y: u(lvl - 1),
          h: p(lvl - 1),
          duration: cr,
          delay,
          ease: 'backExpoInOut',
          onUpdate() {
            rect.setAttribute('y', fmt(H.y));
            rect.setAttribute('height', fmt(H.h));
          },
        });

        gsap.to(H, {
          w: barWidth(lvl - 1),
          duration: cr * 0.7,
          delay: Math.max(0, delay - 0.25),
          ease: 'backExpoInOut',
          onUpdate() {
            rect.setAttribute('x', fmt((width - H.w) / 2));
            rect.setAttribute('width', fmt(H.w));
          },
        });
      });
    };

    const onCycle = () => {
      gsap.killTweensOf(data.el);
      const zeroIdx = data.level.findIndex((lvl) => lvl === 0);
      for (let i = 0; i < data.level.length; i++) {
        data.level[i]--;
      }

      if (zeroIdx !== -1) {
        d = (d + 1) % Ut;
        data.level[zeroIdx] = a;
        const recycled = data.el[zeroIdx];
        recycled.setAttribute('x', fmt(barX(a)));
        recycled.setAttribute('y', fmt(u(a)));
        recycled.setAttribute('width', fmt(barWidth(a)));
        recycled.setAttribute('height', fmt(p(a)));
        recycled.setAttribute('fill', colors[d]);
        g.insertBefore(recycled, g.firstChild);
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
    <div ref={containerRef} className="b-usp-asset-capacity absolute inset-0 w-full h-full z-[2]" aria-hidden="true">
      <svg ref={svgRef} className="b__svg block w-full h-full overflow-hidden" xmlns={SVG_NS}>
        <g ref={gRef} className="b__svg__rects" />
      </svg>
    </div>
  );
};

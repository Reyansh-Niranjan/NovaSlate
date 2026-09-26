import React, { useEffect, useRef } from 'react';
import { curriculumModules, renderCurriculumCardImage } from '@/data/curriculumCards';

interface FloatingCard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  scale: number;
  targetScale: number;
  opacity: number;
  image: HTMLCanvasElement | HTMLImageElement;
  width: number;
  height: number;
  life: number;
  maxLife: number;
}

export const ExecutionCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement || canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = (canvas.width = container.clientWidth * dpr);
    let height = (canvas.height = container.clientHeight * dpr);

    // Pre-render curriculum cards
    const loadedImages: HTMLCanvasElement[] = curriculumModules.map((mod) =>
      renderCurriculumCardImage(mod, Math.min(dpr, 1.5))
    );

    const baseCardWidth = 260 * dpr;

    const cards: FloatingCard[] = [];
    let lastX = -1;
    let lastY = -1;
    let lastSpawnTime = 0;
    let imageIndex = 0;
    let isVisible = false;
    let isRunning = false;
    let animationFrameId: number;

    const startLoop = () => {
      if (!isRunning && isVisible) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const spawnCard = (x: number, y: number, dirX: number, dirY: number) => {
      if (loadedImages.length === 0) return;

      const img = loadedImages[imageIndex % loadedImages.length];
      imageIndex++;

      const aspect = (img.height || 2) / (img.width || 3);
      const cWidth = baseCardWidth;
      const cHeight = baseCardWidth * aspect;

      cards.push({
        x,
        y,
        vx: dirX * 1.8 + (Math.random() - 0.5) * 1.6,
        vy: dirY * 1.8 + (Math.random() - 0.5) * 1.6,
        angle: (Math.random() - 0.5) * 0.35,
        vAngle: (Math.random() - 0.5) * 0.015,
        scale: 0.35,
        targetScale: 0.95 + Math.random() * 0.15,
        opacity: 1,
        image: img,
        width: cWidth,
        height: cHeight,
        life: 0,
        maxLife: 200 + Math.random() * 60,
      });

      // Cap at 10 floating cards for mobile performance
      if (cards.length > 10) {
        cards.shift();
      }

      startLoop();
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;

      if (x < 0 || x > width || y < 0 || y > height) return;

      const now = performance.now();
      const dist = Math.hypot(x - lastX, y - lastY);

      if (dist > 45 && now - lastSpawnTime > 80) {
        const dirX = lastX < 0 ? 0 : (x - lastX) / (dist || 1);
        const dirY = lastY < 0 ? 0 : (y - lastY) / (dist || 1);
        spawnCard(x, y, dirX, dirY);
        lastSpawnTime = now;
      }

      lastX = x;
      lastY = y;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * dpr;
        const y = (touch.clientY - rect.top) * dpr;

        if (x < 0 || x > width || y < 0 || y > height) return;

        const now = performance.now();
        const dist = Math.hypot(x - lastX, y - lastY);

        if (dist > 50 && now - lastSpawnTime > 120) {
          const dirX = lastX < 0 ? 0 : (x - lastX) / (dist || 1);
          const dirY = lastY < 0 ? 0 : (y - lastY) / (dist || 1);
          spawnCard(x, y, dirX, dirY);
          lastSpawnTime = now;
        }

        lastX = x;
        lastY = y;
      }
    };

    // Auto-spawn initial cards so canvas is alive on load
    const initialTimer = setTimeout(() => {
      if (loadedImages.length > 0) {
        const cx = width * 0.58;
        const cy = height * 0.52;
        spawnCard(cx, cy, 0.2, -0.1);
      }
    }, 400);

    container.addEventListener('mousemove', handlePointerMove as EventListener);
    container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: true });

    const handleResize = () => {
      width = canvas.width = container.clientWidth * dpr;
      height = canvas.height = container.clientHeight * dpr;
      if (cards.length > 0) startLoop();
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!isVisible) {
        isRunning = false;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // IDLE STOP: When cards fade out, pause RAF completely (0% CPU/GPU)
      if (cards.length === 0) {
        isRunning = false;
        return;
      }

      for (let i = cards.length - 1; i >= 0; i--) {
        const c = cards[i];
        c.life++;
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.97;
        c.vy *= 0.97;
        c.angle += c.vAngle;
        c.vAngle *= 0.985;

        if (c.scale < c.targetScale) {
          c.scale += (c.targetScale - c.scale) * 0.15;
        }

        if (c.life > c.maxLife - 50) {
          c.opacity = Math.max(0, (c.maxLife - c.life) / 50);
        }

        if (c.life >= c.maxLife) {
          cards.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.scale(c.scale, c.scale);
        ctx.globalAlpha = c.opacity;

        const w = c.width;
        const h = c.height;
        const r = 10 * dpr;

        // Lightweight shadow (reduced blur radius prevents heavy 2D Gaussian kernel)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 8 * dpr;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4 * dpr;

        // Rounded rect clip
        ctx.beginPath();
        ctx.moveTo(-w / 2 + r, -h / 2);
        ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
        ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
        ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
        ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.save();
        ctx.clip();
        ctx.drawImage(c.image, -w / 2, -h / 2, w, h);
        ctx.restore();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry.isIntersecting;
        if (isVisible && cards.length > 0) {
          startLoop();
        } else if (!isVisible) {
          isRunning = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => {
      clearTimeout(initialTimer);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      container.removeEventListener('mousemove', handlePointerMove as EventListener);
      container.removeEventListener('touchmove', handleTouchMove as EventListener);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="b__canvas b__canvas--editorial-refined" aria-hidden="true" />;
};

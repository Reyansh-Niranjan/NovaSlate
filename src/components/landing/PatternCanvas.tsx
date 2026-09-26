import React, { useEffect, useRef } from 'react';

export interface PatternCanvasProps {
  immediate?: boolean;
  staticFlow?: boolean;
  className?: string;
}

export const PatternCanvas: React.FC<PatternCanvasProps> = ({
  immediate = false,
  staticFlow = false,
  className = "b-fluid__canvas pointer-events-none absolute inset-0 w-full h-full block"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    // Ponytail & GSAP performance: Dithering shader looks sharper and uses 4x-9x less GPU at 1x DPR
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    const isStatic = staticFlow || isMobile;
    const dpr = 1.0;
    let width = (canvas.width = (canvas.parentElement?.clientWidth || window.innerWidth) * dpr);
    let height = (canvas.height = (canvas.parentElement?.clientHeight || window.innerHeight) * dpr);

    const vsSource = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;

      varying vec2 vUv;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_pixelRatio;
      uniform float u_fade;

      float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p.yx + 19.19);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p, float time) {
        float value = 0.0;
        float amplitude = 0.5;
        float phase = time * 0.015;
        for (int i = 0; i < 2; i++) {
          value += amplitude * noise(p);
          float fi = phase + float(i) * 0.5;
          p = p * 1.5 + vec2(12.7 + cos(fi) * 0.5, 4.3 + sin(fi) * 0.5);
          amplitude *= 0.5;
        }
        return value;
      }

      float shapeNoise(vec2 p, float time) {
        vec2 offset = vec2(fbm(p + vec2(7.1, -3.9), time) - 0.5) * 3.0;
        return fbm(p + offset, time);
      }

      float bayer4(vec2 pixelPos) {
        vec2 p  = mod(pixelPos, 4.0);
        vec2 p2 = mod(p, 2.0);
        vec2 p4 = floor(p * 0.5);
        float inner = 2.0 * (p2.x + p2.y - 2.0 * p2.x * p2.y) + p2.y;
        float outer = 2.0 * (p4.x + p4.y - 2.0 * p4.x * p4.y) + p4.y;
        return (4.0 * inner + outer) / 16.0;
      }

      void main () {
        // --- Dithering block size ---
        float blockSize = 2.5 * u_pixelRatio;
        vec2 blockCoord = floor(gl_FragCoord.xy / blockSize);
        vec2 blockCenter = (blockCoord + 0.5) * blockSize;
        vec2 blockUv = blockCenter / u_resolution.xy;
        vec2 centeredUv = blockUv - 0.5;
        centeredUv.x *= u_resolution.x / max(u_resolution.y, 1.0);

        float t = u_time * 0.03;
        vec2 flow = vec2(t, -t * 0.65);
        vec2 noiseUv = vec2(centeredUv.x * 1.5, centeredUv.y * 1.5 * 0.45) + flow;

        float base = shapeNoise(noiseUv, u_time);
        base = (base - 0.5) * 6.0 + 0.5;
        base *= 1.5;
        base = clamp(base, 0.0, 1.0);

        // Bayer 4x4 dither threshold
        float threshold = (bayer4(blockCoord) - 0.5) * 2.0;
        float dithered = step(0.5, clamp(base + threshold, 0.0, 1.0));

        // NovaSlate Brand Palette (#88A9B6, #DEE4E6, #EBF1F3)
        vec3 darkColor  = vec3(0.533, 0.663, 0.714); // #88A9B6 (Slate Blue)
        vec3 lightColor = vec3(0.871, 0.894, 0.902); // #DEE4E6 (Pale Slate)

        vec3 patternColor = mix(darkColor, lightColor, dithered);

        // Smooth fade-in over 2-3s from base page background #EBF1F3
        vec3 cleanBg = vec3(0.922, 0.945, 0.953); // #EBF1F3
        vec3 finalColor = mix(cleanBg, patternColor, u_fade);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uPixelRatioLoc = gl.getUniformLocation(program, 'u_pixelRatio');
    const uFadeLoc = gl.getUniformLocation(program, 'u_fade');

    let startTime = performance.now();
    let lastRenderTime = 0;
    let animationFrameId: number;
    let isVisible = true;

    const handleResize = () => {
      width = canvas.width = (canvas.parentElement?.clientWidth || window.innerWidth) * dpr;
      height = canvas.height = (canvas.parentElement?.clientHeight || window.innerHeight) * dpr;
      gl.viewport(0, 0, width, height);
      if (isStatic) {
        render();
      }
    };
    window.addEventListener('resize', handleResize);
    gl.viewport(0, 0, width, height);

    const render = () => {
      if (!isVisible) return;

      const now = performance.now();
      // On desktop, throttle render to 24 FPS (~41ms) to eliminate battery & GPU drain
      if (!isStatic && now - lastRenderTime < 41) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      const elapsed = (now - startTime) * 0.001; // seconds

      let fade = 1.0;
      if (!immediate) {
        if (elapsed <= 1.2) {
          fade = 0;
        } else {
          fade = Math.min(1.0, (elapsed - 1.2) / 2.0);
          // Smoothstep easing
          fade = fade * fade * (3.0 - 2.0 * fade);
        }
      }

      gl.useProgram(program);
      gl.uniform1f(uTimeLoc, isStatic ? 0.0 : elapsed);
      gl.uniform2f(uResLoc, width, height);
      gl.uniform1f(uPixelRatioLoc, dpr);
      gl.uniform1f(uFadeLoc, fade);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!isStatic) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          render();
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      // memory-leak-debugging: Free WebGL resources
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
    };
  }, [immediate, staticFlow]);

  return <canvas ref={canvasRef} className={className} />;
};

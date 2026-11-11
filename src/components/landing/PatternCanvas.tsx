import React, { useEffect, useRef } from 'react';
import { detectGraphicsCapabilities, getSharedGpuDevice } from '@/lib/gpuDetector';

export interface PatternCanvasProps {
  immediate?: boolean;
  staticFlow?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// WGSL Shader (WebGPU Tier 1)
// ---------------------------------------------------------------------------
const WGSL_SHADER = `
struct Uniforms {
  time: f32,
  pixelRatio: f32,
  fade: f32,
  pad: f32,
  resolution: vec2f,
  pad2: vec2f,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOutput {
  var pos = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f( 1.0, -1.0),
    vec2f(-1.0,  1.0),
    vec2f(-1.0,  1.0),
    vec2f( 1.0, -1.0),
    vec2f( 1.0,  1.0)
  );
  var out: VertexOutput;
  out.position = vec4f(pos[index], 0.0, 1.0);
  out.uv = pos[index] * 0.5 + vec2f(0.5);
  return out;
}

fn hash21(p_in: vec2f) -> f32 {
  var p = fract(p_in * vec2f(127.1, 311.7));
  p += dot(p, vec2f(p.y, p.x) + 19.19);
  return fract(p.x * p.y);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  let u_smooth = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u_smooth.x) + (c - a) * u_smooth.y * (1.0 - u_smooth.x) + (d - b) * u_smooth.x * u_smooth.y;
}

fn fbm(p_in: vec2f, time: f32) -> f32 {
  var p = p_in;
  var value: f32 = 0.0;
  var amplitude: f32 = 0.5;
  let phase = time * 0.015;
  for (var i = 0; i < 2; i++) {
    value += amplitude * noise(p);
    let fi = phase + f32(i) * 0.5;
    p = p * 1.5 + vec2f(12.7 + cos(fi) * 0.5, 4.3 + sin(fi) * 0.5);
    amplitude *= 0.5;
  }
  return value;
}

fn shapeNoise(p: vec2f, time: f32) -> f32 {
  let val = fbm(p + vec2f(7.1, -3.9), time);
  let offset = (vec2f(val, val) - 0.5) * 3.0;
  return fbm(p + offset, time);
}

fn bayer4(pixelPos: vec2f) -> f32 {
  let p = pixelPos - 4.0 * floor(pixelPos / 4.0);
  let p2 = p - 2.0 * floor(p / 2.0);
  let p4 = floor(p * 0.5);
  let inner = 2.0 * (p2.x + p2.y - 2.0 * p2.x * p2.y) + p2.y;
  let outer = 2.0 * (p4.x + p4.y - 2.0 * p4.x * p4.y) + p4.y;
  return (4.0 * inner + outer) / 16.0;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
  let blockSize = 2.5 * u.pixelRatio;
  let blockCoord = floor(in.position.xy / blockSize);
  let blockCenter = (blockCoord + 0.5) * blockSize;
  let blockUv = blockCenter / u.resolution;
  var centeredUv = blockUv - 0.5;
  centeredUv.x *= u.resolution.x / max(u.resolution.y, 1.0);

  let t = u.time * 0.03;
  let flow = vec2f(t, -t * 0.65);
  let noiseUv = vec2f(centeredUv.x * 1.5, centeredUv.y * 1.5 * 0.45) + flow;

  var base = shapeNoise(noiseUv, u.time);
  base = (base - 0.5) * 6.0 + 0.5;
  base *= 1.5;
  base = clamp(base, 0.0, 1.0);

  let threshold = (bayer4(blockCoord) - 0.5) * 2.0;
  let dithered = step(0.5, clamp(base + threshold, 0.0, 1.0));

  let darkColor  = vec3f(0.533, 0.663, 0.714); // #88A9B6 (Slate Blue)
  let lightColor = vec3f(0.871, 0.894, 0.902); // #DEE4E6 (Pale Slate)
  let cleanBg    = vec3f(0.922, 0.945, 0.953); // #EBF1F3

  let patternColor = mix(darkColor, lightColor, dithered);
  let finalColor = mix(cleanBg, patternColor, u.fade);

  return vec4f(finalColor, 1.0);
}
`;

// ---------------------------------------------------------------------------
// GLSL Shaders (WebGL Tier 2)
// ---------------------------------------------------------------------------
const GLSL_VS = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const GLSL_FS = `
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

    float threshold = (bayer4(blockCoord) - 0.5) * 2.0;
    float dithered = step(0.5, clamp(base + threshold, 0.0, 1.0));

    vec3 darkColor  = vec3(0.533, 0.663, 0.714); // #88A9B6
    vec3 lightColor = vec3(0.871, 0.894, 0.902); // #DEE4E6
    vec3 cleanBg    = vec3(0.922, 0.945, 0.953); // #EBF1F3

    vec3 patternColor = mix(darkColor, lightColor, dithered);
    vec3 finalColor = mix(cleanBg, patternColor, u_fade);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const PatternCanvas: React.FC<PatternCanvasProps> = ({
  immediate = true,
  staticFlow = false,
  className = "ns-fluid__canvas b-fluid__canvas pointer-events-none absolute inset-0 w-full h-full block"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | undefined;
    let isCancelled = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const isStatic = staticFlow || prefersReducedMotion;
    const dpr = 1.0;

    // -------------------------------------------------------------------------
    // Tier 1: WebGPU Renderer (Native modern hardware)
    // -------------------------------------------------------------------------
    const tryWebGPU = async (): Promise<(() => void) | null> => {
      try {
        let device = getSharedGpuDevice();
        if (!device && typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
          const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
          if (adapter) {
            device = await adapter.requestDevice();
          }
        }
        if (!device) return null;

        const context = canvas.getContext('webgpu') as any;
        if (!context) return null;

        const format = (navigator as any).gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: 'premultiplied',
        });

        const shaderModule = device.createShaderModule({ code: WGSL_SHADER });
        const uniformBuffer = device.createBuffer({
          size: 32,
          usage: ((window as any).GPUBufferUsage?.UNIFORM ?? 0x0040) | ((window as any).GPUBufferUsage?.COPY_DST ?? 0x0008),
        });

        const pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: {
            module: shaderModule,
            entryPoint: 'vs_main',
          },
          fragment: {
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format }],
          },
          primitive: {
            topology: 'triangle-list',
          },
        });

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
        });

        let width = (canvas.width = (canvas.parentElement?.clientWidth || window.innerWidth) * dpr);
        let height = (canvas.height = (canvas.parentElement?.clientHeight || window.innerHeight) * dpr);

        let startTime = performance.now();
        let lastRenderTime = 0;
        let animationFrameId: number;
        let isVisible = true;

        const handleResize = () => {
          const parent = canvas.parentElement;
          const targetWidth = (parent?.clientWidth || window.innerWidth) * dpr;
          const targetHeight = (parent?.clientHeight || window.innerHeight) * dpr;
          if (width !== targetWidth || height !== targetHeight) {
            width = canvas.width = targetWidth;
            height = canvas.height = targetHeight;
            if (isStatic) render();
          }
        };

        window.addEventListener('resize', handleResize);
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
          resizeObserver = new ResizeObserver(handleResize);
          resizeObserver.observe(canvas.parentElement);
        }

        const uniformData = new Float32Array(8);

        const render = () => {
          if (!isVisible) return;

          const now = performance.now();
          const fpsInterval = isMobile ? 50 : 41;
          if (!isStatic && now - lastRenderTime < fpsInterval) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }
          lastRenderTime = now;

          const elapsed = (now - startTime) * 0.001;
          let fade = 1.0;
          if (!immediate && !isStatic) {
            const progress = Math.min(1.0, elapsed / 0.6);
            fade = progress * progress * (3.0 - 2.0 * progress);
          }

          uniformData[0] = isStatic ? 0.0 : elapsed;
          uniformData[1] = dpr;
          uniformData[2] = fade;
          uniformData[3] = 0;
          uniformData[4] = width;
          uniformData[5] = height;
          uniformData[6] = 0;
          uniformData[7] = 0;

          device.queue.writeBuffer(uniformBuffer, 0, uniformData);

          try {
            const commandEncoder = device.createCommandEncoder();
            const textureView = context.getCurrentTexture().createView();
            const renderPass = commandEncoder.beginRenderPass({
              colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.922, g: 0.945, b: 0.953, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
              }],
            });
            renderPass.setPipeline(pipeline);
            renderPass.setBindGroup(0, bindGroup);
            renderPass.draw(6);
            renderPass.end();
            device.queue.submit([commandEncoder.finish()]);
          } catch {
            // context loss / resize edge case
          }

          if (!isStatic || fade < 1.0) {
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
          resizeObserver?.disconnect();
          window.removeEventListener('resize', handleResize);
          try {
            uniformBuffer.destroy();
          } catch {
            // noop
          }
        };
      } catch (err) {
        return null;
      }
    };

    // -------------------------------------------------------------------------
    // Tier 2: WebGL Renderer (WebGL 2 / WebGL 1)
    // -------------------------------------------------------------------------
    const tryWebGL = (): (() => void) | null => {
      let gl: WebGLRenderingContext | null = null;
      try {
        gl = (
          (canvas.getContext('webgl2', {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
          }) as WebGLRenderingContext | null) ||
          (canvas.getContext('webgl', {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
          }) as WebGLRenderingContext | null) ||
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
        );
      } catch {
        return null;
      }

      if (!gl) return null;

      let width = (canvas.width = (canvas.parentElement?.clientWidth || window.innerWidth) * dpr);
      let height = (canvas.height = (canvas.parentElement?.clientHeight || window.innerHeight) * dpr);

      function createShader(type: number, source: string): WebGLShader | null {
        const shader = gl!.createShader(type);
        if (!shader) return null;
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          gl!.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = createShader(gl.VERTEX_SHADER, GLSL_VS);
      const fs = createShader(gl.FRAGMENT_SHADER, GLSL_FS);
      if (!vs || !fs) return null;

      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return null;
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
        const parent = canvas.parentElement;
        const targetWidth = (parent?.clientWidth || window.innerWidth) * dpr;
        const targetHeight = (parent?.clientHeight || window.innerHeight) * dpr;
        if (width !== targetWidth || height !== targetHeight) {
          width = canvas.width = targetWidth;
          height = canvas.height = targetHeight;
          gl!.viewport(0, 0, width, height);
          if (isStatic) render();
        }
      };

      window.addEventListener('resize', handleResize);
      gl.viewport(0, 0, width, height);

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(canvas.parentElement);
      }

      const render = () => {
        if (!isVisible) return;

        const now = performance.now();
        const fpsInterval = isMobile ? 50 : 41;
        if (!isStatic && now - lastRenderTime < fpsInterval) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
        lastRenderTime = now;

        const elapsed = (now - startTime) * 0.001;

        let fade = 1.0;
        if (!immediate && !isStatic) {
          const progress = Math.min(1.0, elapsed / 0.6);
          fade = progress * progress * (3.0 - 2.0 * progress);
        }

        gl!.useProgram(program);
        gl!.uniform1f(uTimeLoc, isStatic ? 0.0 : elapsed);
        gl!.uniform2f(uResLoc, width, height);
        gl!.uniform1f(uPixelRatioLoc, dpr);
        gl!.uniform1f(uFadeLoc, fade);

        gl!.drawArrays(gl!.TRIANGLES, 0, 6);

        if (!isStatic || fade < 1.0) {
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
        resizeObserver?.disconnect();
        window.removeEventListener('resize', handleResize);
        gl!.deleteBuffer(quadBuffer);
        gl!.deleteProgram(program);
      };
    };

    // -------------------------------------------------------------------------
    // Tier 3: 2D Canvas Fallback (uBlock Origin / Privacy extensions)
    // -------------------------------------------------------------------------
    const try2DFallback = (): (() => void) | null => {
      try {
        const ctx2d = canvas.getContext('2d');
        if (!ctx2d) return null;

        const draw2DFallback = () => {
          const w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
          const h = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

          const tile = document.createElement('canvas');
          tile.width = 4;
          tile.height = 4;
          const tCtx = tile.getContext('2d');
          if (tCtx) {
            const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
            const imgData = tCtx.createImageData(4, 4);
            for (let i = 0; i < 16; i++) {
              const isDark = bayer[i] < 8;
              imgData.data[i * 4 + 0] = isDark ? 136 : 222; // #88A9B6 : #DEE4E6
              imgData.data[i * 4 + 1] = isDark ? 169 : 228;
              imgData.data[i * 4 + 2] = isDark ? 182 : 230;
              imgData.data[i * 4 + 3] = 255;
            }
            tCtx.putImageData(imgData, 0, 0);

            const pat = ctx2d.createPattern(tile, 'repeat');
            if (pat) {
              ctx2d.fillStyle = pat;
              ctx2d.fillRect(0, 0, w, h);
            }
          }
        };

        draw2DFallback();
        window.addEventListener('resize', draw2DFallback);
        return () => window.removeEventListener('resize', draw2DFallback);
      } catch {
        return null;
      }
    };

    // -------------------------------------------------------------------------
    // Cascade Orchestrator: Dynamic Client Browser & Device Adaptation
    // -------------------------------------------------------------------------
    const startPipeline = async () => {
      const caps = await detectGraphicsCapabilities();

      // 1. If user's browser supports WebGPU, launch native WebGPU pipeline
      if (caps.backend === 'webgpu') {
        const gpuCleanup = await tryWebGPU();
        if (isCancelled) {
          gpuCleanup?.();
          return;
        }
        if (gpuCleanup) {
          cleanup = gpuCleanup;
          return;
        }
      }

      // 2. If user's browser uses WebGL (or WebGPU initialization failed)
      if (caps.supportsWebGL2 || caps.supportsWebGL1 || caps.backend === 'webgl2' || caps.backend === 'webgl' || caps.backend === 'webgpu') {
        const glCleanup = tryWebGL();
        if (isCancelled) {
          glCleanup?.();
          return;
        }
        if (glCleanup) {
          cleanup = glCleanup;
          return;
        }
      }

      // 3. Fallback to 2D Canvas Bayer matrix (uBlock Origin / strict adblock)
      const fallbackCleanup = try2DFallback();
      if (isCancelled) {
        fallbackCleanup?.();
        return;
      }
      if (fallbackCleanup) {
        cleanup = fallbackCleanup;
        return;
      }

      // 4. Pure CSS fallback is active on container .b-fluid / .ns-fluid
    };

    startPipeline();

    return () => {
      isCancelled = true;
      cleanup?.();
    };
  }, [immediate, staticFlow]);

  return <canvas ref={canvasRef} className={className} />;
};

export default PatternCanvas;

/**
 * NovaSlate Client-Side Graphics & GPU Capability Detector
 *
 * Dynamically audits ANY user's device, browser, and hardware at runtime:
 * 1. Checks Browser & OS (Chrome, Edge, Safari, Firefox, iOS, Android, Windows, macOS, Linux).
 * 2. Checks WebGPU support via `navigator.gpu.requestAdapter()`.
 *    - Acquires a shared singleton `GPUDevice` to avoid "Too many devices" errors across multiple canvases.
 * 3. Checks WebGL 2.0 and WebGL 1.0 support.
 * 4. Detects Privacy/Adblock extensions (e.g. uBlock Origin, Brave Shields blocking WebGL/Canvas).
 * 5. Returns the best available graphics backend: 'webgpu' -> 'webgl2' -> 'webgl' -> 'canvas2d' -> 'css'.
 */

export type GraphicsBackend = 'webgpu' | 'webgl2' | 'webgl' | 'canvas2d' | 'css';

export interface DeviceInfo {
  browser: string;
  os: string;
  isMobile: boolean;
  isTouch: boolean;
  hardwareConcurrency: number;
}

export interface GpuCapabilities {
  backend: GraphicsBackend;
  deviceInfo: DeviceInfo;
  supportsWebGPU: boolean;
  supportsWebGL2: boolean;
  supportsWebGL1: boolean;
  supportsCanvas2D: boolean;
  adapterInfo?: {
    vendor?: string;
    architecture?: string;
    description?: string;
  };
  reason: string;
}

export function detectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      browser: 'SSR / Headless',
      os: 'Unknown',
      isMobile: false,
      isTouch: false,
      hardwareConcurrency: 4,
    };
  }

  const ua = navigator.userAgent || '';
  let browser = 'Unknown Browser';
  if (/Edg\//.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Apple Safari';
  else if (/OPR\//.test(ua) || /Opera\//.test(ua)) browser = 'Opera';

  let os = 'Unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  const isMobile =
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    window.innerWidth < 768;
  const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;

  return {
    browser,
    os,
    isMobile,
    isTouch,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
  };
}

let cachedCapabilities: GpuCapabilities | null = null;
let sharedGpuDevice: GPUDevice | null = null;
let probePromise: Promise<GpuCapabilities> | null = null;

export async function detectGraphicsCapabilities(): Promise<GpuCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;
  if (probePromise) return probePromise;

  probePromise = (async () => {
    const deviceInfo = detectDeviceInfo();

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      cachedCapabilities = {
        backend: 'css',
        deviceInfo,
        supportsWebGPU: false,
        supportsWebGL2: false,
        supportsWebGL1: false,
        supportsCanvas2D: false,
        reason: 'Server-side rendering environment',
      };
      return cachedCapabilities;
    }

    let supportsWebGPU = false;
    let supportsWebGL2 = false;
    let supportsWebGL1 = false;
    let supportsCanvas2D = false;
    let adapterInfo: any = undefined;

    // 1. Probe WebGPU for user's browser
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
        if (adapter) {
          try {
            sharedGpuDevice = await adapter.requestDevice();
            supportsWebGPU = true;
            if ((adapter as any).info) {
              adapterInfo = {
                vendor: (adapter as any).info.vendor,
                architecture: (adapter as any).info.architecture,
                description: (adapter as any).info.description,
              };
            }
          } catch {
            // requestDevice failed (e.g. browser WebGPU limit or GPU process reset)
          }
        }
      } catch {
        // requestAdapter failed
      }
    }

    // 2. Probe WebGL 2, WebGL 1, and Canvas 2D
    try {
      const probeCanvas = document.createElement('canvas');
      probeCanvas.width = 2;
      probeCanvas.height = 2;

      try {
        const gl2 = probeCanvas.getContext('webgl2', { antialias: false, depth: false });
        if (gl2) supportsWebGL2 = true;
      } catch {}

      try {
        const gl1 =
          probeCanvas.getContext('webgl', { antialias: false, depth: false }) ||
          probeCanvas.getContext('experimental-webgl');
        if (gl1) supportsWebGL1 = true;
      } catch {}

      try {
        const ctx2d = probeCanvas.getContext('2d');
        if (ctx2d) supportsCanvas2D = true;
      } catch {}
    } catch {}

    // 3. Select optimal backend based on client browser capability
    let backend: GraphicsBackend = 'css';
    let reason = '';

    if (supportsWebGPU && sharedGpuDevice) {
      backend = 'webgpu';
      reason = `Native WebGPU hardware acceleration supported on ${deviceInfo.browser} (${deviceInfo.os})`;
    } else if (supportsWebGL2) {
      backend = 'webgl2';
      reason = `WebGL 2.0 active (WebGPU ${supportsWebGPU ? 'device creation failed' : 'not supported on this browser'})`;
    } else if (supportsWebGL1) {
      backend = 'webgl';
      reason = `WebGL 1.0 active (WebGL 2.0 unsupported)`;
    } else if (supportsCanvas2D) {
      backend = 'canvas2d';
      reason = `Canvas 2D Bayer dither fallback active (WebGL disabled or blocked by privacy/ad-blocker)`;
    } else {
      backend = 'css';
      reason = 'Zero-JS CSS radial gradient fallback active';
    }

    cachedCapabilities = {
      backend,
      deviceInfo,
      supportsWebGPU,
      supportsWebGL2,
      supportsWebGL1,
      supportsCanvas2D,
      adapterInfo,
      reason,
    };

    // Expose diagnostic object in browser window for live inspection on any user's device
    if (typeof window !== 'undefined') {
      (window as any).__NOVASLATE_GRAPHICS__ = cachedCapabilities;
      try {
        console.info(
          `%c[NovaSlate Graphics]%c ${deviceInfo.browser} on ${deviceInfo.os} -> Active Backend: ${backend.toUpperCase()} (${reason})`,
          'background: #0a567a; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
          'color: inherit;'
        );
      } catch {}
    }

    return cachedCapabilities;
  })();

  return probePromise;
}

export function getSharedGpuDevice(): GPUDevice | null {
  return sharedGpuDevice;
}

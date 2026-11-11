import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  detectDeviceInfo,
  detectGraphicsCapabilities,
  getSharedGpuDevice,
} from '../src/lib/gpuDetector.ts';

describe('Graphics & GPU Detector Deep Module', () => {
  test('detectDeviceInfo extracts valid browser and device taxonomy', () => {
    const info = detectDeviceInfo();
    assert.ok(typeof info.browser === 'string', 'browser must be string');
    assert.ok(typeof info.os === 'string', 'os must be string');
    assert.ok(typeof info.isMobile === 'boolean', 'isMobile must be boolean');
    assert.ok(typeof info.isTouch === 'boolean', 'isTouch must be boolean');
    assert.ok(info.hardwareConcurrency >= 1, 'hardwareConcurrency must be >= 1');
  });

  test('detectGraphicsCapabilities determines backend hierarchy without throwing in non-GPU environment', async () => {
    const caps = await detectGraphicsCapabilities();
    assert.ok(caps.backend, 'backend must be defined');
    assert.ok(
      ['webgpu', 'webgl2', 'webgl', 'canvas2d', 'css'].includes(caps.backend),
      `backend "${caps.backend}" must be valid`
    );
    assert.ok(typeof caps.supportsWebGPU === 'boolean');
    assert.ok(typeof caps.supportsWebGL2 === 'boolean');
    assert.ok(typeof caps.supportsWebGL1 === 'boolean');
    assert.ok(typeof caps.supportsCanvas2D === 'boolean');
    assert.ok(typeof caps.reason === 'string' && caps.reason.length > 0);
  });

  test('getSharedGpuDevice returns null or GPUDevice instance', () => {
    const dev = getSharedGpuDevice();
    assert.ok(dev === null || typeof dev === 'object');
  });
});

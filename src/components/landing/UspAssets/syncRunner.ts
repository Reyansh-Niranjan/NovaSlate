import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

if (!CustomEase.get('backExpoInOut')) {
  CustomEase.create(
    'backExpoInOut',
    'M0,0 C0.214,-0.173 0.269,-0.083 0.3,0 0.359,0.165 0.345,0.211 0.372,0.427 0.4,0.655 0.436,0.823 0.54,0.892 0.629,0.951 0.698,1 1,1 '
  );
}

type Callback = () => void;

const durations = new Map<number, number>();
const listeners = new Map<number, Callback>();
let tickerTween: gsap.core.Tween | null = null;
let idCounter = 0;

let isPaused = false;

function scheduleCycle() {
  if (tickerTween) {
    tickerTween.kill();
    tickerTween = null;
  }
  if (durations.size === 0 || isPaused) return;
  const maxDuration = Math.max(...durations.values());
  tickerTween = gsap.delayedCall(maxDuration, () => {
    if (isPaused) return;
    listeners.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error(err);
      }
    });
    scheduleCycle();
  });
}

export function pauseUspRunner() {
  isPaused = true;
  if (tickerTween) {
    tickerTween.pause();
  }
}

export function resumeUspRunner() {
  if (isPaused) {
    isPaused = false;
    if (tickerTween) {
      tickerTween.resume();
    } else {
      scheduleCycle();
    }
  }
}

export function registerUspAsset(initialDuration: number, onCycle: Callback) {
  const id = ++idCounter;
  durations.set(id, initialDuration);
  listeners.set(id, onCycle);
  scheduleCycle();

  return {
    updateDuration(newDuration: number) {
      durations.set(id, newDuration);
      scheduleCycle();
    },
    unregister() {
      durations.delete(id);
      listeners.delete(id);
      if (durations.size === 0 && tickerTween) {
        tickerTween.kill();
        tickerTween = null;
      }
    },
  };
}

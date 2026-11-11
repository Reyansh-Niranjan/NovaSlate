/**
 * Deep Module: ReadingEngine
 * Encapsulates viewport geometry calculations, zoom constraints, theme cycling,
 * and cancelable render queue lifecycles away from presentation components.
 */

export type ReadingTheme = "light" | "dark" | "sepia" | "charcoal";

export interface ReadingThemeStyles {
  background: string;
  containerBg: string;
  canvasFilter?: string;
  textColor: string;
}

export const READING_THEMES: Record<ReadingTheme, ReadingThemeStyles> = {
  dark: {
    background: "bg-[#0b0f17]",
    containerBg: "bg-[#111827]/80",
    canvasFilter: "invert(0.92) hue-rotate(180deg) contrast(1.05)",
    textColor: "text-gray-100",
  },
  sepia: {
    background: "bg-[#f4ecd8]",
    containerBg: "bg-[#fbf7ee]",
    canvasFilter: "sepia(0.35) contrast(0.95)",
    textColor: "text-amber-950",
  },
  charcoal: {
    background: "bg-[#1e1e1e]",
    containerBg: "bg-[#252526]",
    canvasFilter: "invert(0.88) hue-rotate(180deg)",
    textColor: "text-gray-200",
  },
  light: {
    background: "bg-gray-100",
    containerBg: "bg-white",
    canvasFilter: "none",
    textColor: "text-gray-900",
  },
};

export const MIN_SCALE = 0.4;
export const MAX_SCALE = 3.0;

/**
 * Calculates responsive scale so the PDF fits neatly in the reading viewport
 */
export function calculateFitWidthScale(
  pageWidth: number,
  containerWidth: number,
  isMobile: boolean
): number {
  if (pageWidth <= 0 || containerWidth <= 0) return 1.0;
  const padding = isMobile ? 12 : 48;
  const availableWidth = containerWidth - padding;
  if (availableWidth <= 0) return 1.0;
  const calculated = Math.min(Math.max(availableWidth / pageWidth, MIN_SCALE), MAX_SCALE);
  return parseFloat(calculated.toFixed(2));
}

/**
 * Constrains zoom scale within safe visual bounds
 */
export function clampScale(scale: number): number {
  return parseFloat(Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE).toFixed(2));
}

/**
 * Clamps target page number to valid document range
 */
export function clampPage(page: number, maxPages: number): number {
  if (maxPages <= 0) return 1;
  return Math.min(Math.max(1, page), maxPages);
}

/**
 * Rotates through available reading themes
 */
export function cycleReadingTheme(current: ReadingTheme): ReadingTheme {
  switch (current) {
    case "dark":
      return "sepia";
    case "sepia":
      return "charcoal";
    case "charcoal":
      return "light";
    case "light":
    default:
      return "dark";
  }
}

/**
 * Cancelable Render Queue: Encapsulates PDF.js canvas task lifecycle
 * and prevents unhandled promise rejections on fast page scrubbing.
 */
export class RenderQueue {
  private currentTask: any = null;

  cancelActive(): void {
    if (this.currentTask) {
      try {
        this.currentTask.cancel();
      } catch {
        // cancellation is normal when switching pages quickly
      }
      this.currentTask = null;
    }
  }

  setActive(task: any): void {
    this.cancelActive();
    this.currentTask = task;
  }

  clear(): void {
    this.currentTask = null;
  }

  isCancelledError(err: any): boolean {
    return err?.name === "RenderingCancelledException" || err?.message?.includes("Rendering cancelled");
  }
}

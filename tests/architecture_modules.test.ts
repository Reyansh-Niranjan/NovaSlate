import { test, describe, before } from "node:test";
import assert from "node:assert";

// Polyfill minimal browser globals for Node test environment
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    innerWidth: 1024,
    devicePixelRatio: 2,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

import {
  calculateFitWidthScale,
  clampScale,
  clampPage,
  cycleReadingTheme,
  RenderQueue,
} from "../src/lib/readingEngine.ts";

import {
  resolveBookMatch,
  getSubjectListForClass,
  getInternetArchiveUrl,
  isBoardClass,
} from "../src/lib/curriculumCatalog.ts";

import {
  loadChapterStudyBundle,
  setStudyTransportAdapter,
  toggleBookmarkPYQ,
  isPYQBookmarked,
  type StudyTransportAdapter,
  type PYQQuestion,
} from "../src/lib/studyKitStore.ts";

describe("ReadingEngine Deep Module", () => {
  test("calculateFitWidthScale bounds calculation within [0.4, 3.0]", () => {
    // Desktop padding = 48px; container = 1048 -> available = 1000; page = 500 -> scale = 2.0
    const scale = calculateFitWidthScale(500, 1048, false);
    assert.strictEqual(scale, 2.0);

    // Huge page width clamps to MIN_SCALE (0.4)
    const scaleMin = calculateFitWidthScale(5000, 1000, false);
    assert.strictEqual(scaleMin, 0.4);

    // Tiny page width clamps to MAX_SCALE (3.0)
    const scaleMax = calculateFitWidthScale(50, 1000, false);
    assert.strictEqual(scaleMax, 3.0);
  });

  test("clampScale restricts out-of-bounds scales", () => {
    assert.strictEqual(clampScale(0.1), 0.4);
    assert.strictEqual(clampScale(5.0), 3.0);
    assert.strictEqual(clampScale(1.45), 1.45);
  });

  test("clampPage enforces valid 1..max page limits", () => {
    assert.strictEqual(clampPage(-5, 100), 1);
    assert.strictEqual(clampPage(150, 100), 100);
    assert.strictEqual(clampPage(42, 100), 42);
  });

  test("cycleReadingTheme cycles through all themes", () => {
    assert.strictEqual(cycleReadingTheme("dark"), "sepia");
    assert.strictEqual(cycleReadingTheme("sepia"), "charcoal");
    assert.strictEqual(cycleReadingTheme("charcoal"), "light");
    assert.strictEqual(cycleReadingTheme("light"), "dark");
  });

  test("RenderQueue cancels active task and identifies cancelled errors", () => {
    const queue = new RenderQueue();
    let cancelled = false;
    const mockTask = {
      cancel: () => { cancelled = true; },
    };

    queue.setActive(mockTask);
    queue.cancelActive();
    assert.strictEqual(cancelled, true);

    const cancelledErr = { name: "RenderingCancelledException", message: "Rendering cancelled" };
    assert.strictEqual(queue.isCancelledError(cancelledErr), true);
    assert.strictEqual(queue.isCancelledError(new Error("Network failed")), false);
  });
});

describe("CurriculumCatalog Deep Module", () => {
  test("getInternetArchiveUrl properly normalizes paths and encodes components", () => {
    const url = getInternetArchiveUrl("Class 10/Mathematics/Real Numbers.pdf");
    assert.strictEqual(
      url,
      "https://archive.org/download/novaslate-ncert-library/Class%2010/Mathematics/Real%20Numbers.pdf"
    );
  });

  test("isBoardClass accurately checks grades 10 and 12", () => {
    assert.strictEqual(isBoardClass("10"), true);
    assert.strictEqual(isBoardClass("Class 10"), true);
    assert.strictEqual(isBoardClass("12"), true);
    assert.strictEqual(isBoardClass("9"), false);
    assert.strictEqual(isBoardClass("6"), false);
  });

  test("getSubjectListForClass returns ordered taxonomy summaries", () => {
    const class10Subjects = getSubjectListForClass("10");
    assert.ok(class10Subjects.length > 0);
    const math = class10Subjects.find((s) => s.cacheKey === "mathematics");
    assert.ok(math);
    assert.strictEqual(math.label, "Mathematics");
    assert.ok(math.chapterCount > 0);
  });

  test("resolveBookMatch matches textbook codes with high locality and leverage", () => {
    const match = resolveBookMatch("jesc101 - Chemical Reactions.pdf", "10", "Science");
    assert.ok(match);
    assert.strictEqual(match.subject.label, "Science");
    assert.ok(match.activeChapter);
    assert.strictEqual(match.activeChapter.code, "jesc101");
  });
});

describe("StudyKitStore Deep Module & Seams", () => {
  const mockAdapter: StudyTransportAdapter = {
    async fetchPYQs(cacheKey: string, chapterCode: string) {
      return {
        questions: [
          {
            q_num: 1,
            type: "MCQ",
            marks: 1,
            chapter_code: chapterCode,
            q: "What is photosynthesis?",
            options: ["A", "B", "C", "D"],
            passage: null,
            year: 2024,
          },
        ],
        has_premium: false,
        is_premium: false,
        total: 1,
      };
    },
    async fetchChapterKit(cacheKey: string, chapterCode: string) {
      return {
        mind_map: "https://example.com/mindmap.png",
        cheatsheet: "# Chapter Summary",
        flashcards: [{ front: "Q", back: "A" }],
        mcqs: [],
        important: [],
      };
    },
  };

  before(() => {
    setStudyTransportAdapter(mockAdapter);
  });

  test("loadChapterStudyBundle aggregates PYQs and kit data across seam", async () => {
    const bundle = await loadChapterStudyBundle("science", "jesc101", true);
    assert.ok(bundle.pyq);
    assert.strictEqual(bundle.pyq.questions.length, 1);
    assert.strictEqual(bundle.pyq.questions[0].chapter_code, "jesc101");
    assert.ok(bundle.kit);
    assert.strictEqual(bundle.kit.cheatsheet, "# Chapter Summary");
  });

  test("toggleBookmarkPYQ and isPYQBookmarked manage local persistent bookmark ledger", () => {
    const q: PYQQuestion = {
      q_num: 5,
      type: "SA",
      marks: 2,
      chapter_code: "jesc102",
      q: "Explain Ohm's Law",
      options: null,
      passage: null,
      year: 2023,
    };

    assert.strictEqual(isPYQBookmarked(q), false);
    const added = toggleBookmarkPYQ(q);
    assert.strictEqual(added, true);
    assert.strictEqual(isPYQBookmarked(q), true);

    const removed = toggleBookmarkPYQ(q);
    assert.strictEqual(removed, false);
    assert.strictEqual(isPYQBookmarked(q), false);
  });
});

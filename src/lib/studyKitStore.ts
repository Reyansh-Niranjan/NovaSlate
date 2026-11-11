/**
 * Deep Module: StudyKitStore
 * Encapsulates authentication lifecycle, tiered caching (memory + localStorage),
 * in-flight request deduplication, and bookmark storage behind a cohesive interface.
 * Exposes a TransportAdapter seam for automated tests and offline deployment.
 */

import { supabase } from "./supabaseClient.ts";

export interface PYQQuestion {
  q_num: number;
  type: string; // 'MCQ' | 'VSA' | 'SA' | 'LA' | 'CBQ'
  marks: number;
  chapter_code: string;
  q: string;
  options: string[] | null;
  passage: string | null;
  year: number;
  set?: string | null;
}

export interface PYQStats {
  cache_key?: string;
  chapter_code?: string;
  total?: number;
  years?: number[];
  year_count?: number;
  types?: Record<string, number>;
  priority?: string;
}

export interface PYQResponse {
  questions: PYQQuestion[];
  has_premium: boolean;
  is_premium: boolean;
  total: number;
  stats?: PYQStats;
}

export interface FlashcardItem {
  front: string;
  back: string;
  hint?: string;
}

export interface MCQOptionItem {
  q_num?: number;
  question: string;
  options: string[];
  answer?: number | string;
  explanation?: string;
}

export interface ImportantQuestionItem {
  q_num?: number;
  type?: string;
  marks?: number;
  q?: string;
  question?: string;
  answer?: string;
  solution?: string;
  options?: string[];
  passage?: string;
  priority?: string;
}

export interface ChapterKitData {
  mind_map?: string;
  cheatsheet?: string;
  flashcards?: FlashcardItem[];
  mcqs?: MCQOptionItem[];
  important?: ImportantQuestionItem[];
  notes?: any;
  dpp_subtopics?: any[];
  [key: string]: any;
}

export interface ChapterStudyBundle {
  pyq: PYQResponse | null;
  kit: ChapterKitData | null;
  error?: string | null;
}

/**
 * Transport Adapter Seam: Allows network, mock fixtures, or local storage
 * implementations without modifying callers.
 */
export interface StudyTransportAdapter {
  fetchPYQs(cacheKey: string, chapterCode: string): Promise<PYQResponse>;
  fetchChapterKit(cacheKey: string, chapterCode: string): Promise<ChapterKitData>;
}

// ── In-Memory & LocalStorage Tiered Caching ──────────────────────────────────
const CACHE_PREFIX = "studyos_cache_";
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const BOOKMARKS_KEY = "studyos_pyq_bookmarks";

const memoryCache = new Map<string, { timestamp: number; data: any }>();
const inFlightRequests = new Map<string, Promise<any>>();

function readCached<T>(key: string): T | null {
  // Tier 1: In-Memory Cache
  const mem = memoryCache.get(key);
  if (mem) {
    if (Date.now() - mem.timestamp < CACHE_EXPIRY_MS) {
      return mem.data as T;
    }
    memoryCache.delete(key);
  }

  // Tier 2: LocalStorage Cache
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed.data as T;
  } catch {
    return null;
  }
}

function writeCached<T>(key: string, data: T): void {
  const envelope = { timestamp: Date.now(), data };
  memoryCache.set(key, envelope);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(envelope));
  } catch {
    // Quota exceeded or private browsing: memory cache continues operating
  }
}

// ── Default HTTP Network Transport Adapter ───────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error("AUTH_REQUIRED: You must be signed in to access StudyOS materials.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

const defaultHttpAdapter: StudyTransportAdapter = {
  async fetchPYQs(cacheKey: string, chapterCode: string): Promise<PYQResponse> {
    const authHeaders = await getAuthHeaders();
    const url = `/api/studyos/pyq/${cacheKey}/${chapterCode}`;
    const res = await fetch(url, { headers: authHeaders });

    if (res.status === 401 || res.status === 403) {
      throw new Error("AUTH_REQUIRED: Unauthorized. Please sign in to view past year board questions.");
    }
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as PYQResponse;
  },

  async fetchChapterKit(cacheKey: string, chapterCode: string): Promise<ChapterKitData> {
    const authHeaders = await getAuthHeaders();
    const url = `/api/studyos/chapter/${cacheKey}/${chapterCode}`;
    const res = await fetch(url, { headers: authHeaders });

    if (res.status === 401 || res.status === 403) {
      throw new Error("AUTH_REQUIRED: Unauthorized. Please sign in to view chapter study kits.");
    }
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    const raw: any = await res.json();
    return {
      mind_map: raw.mind_map || raw.mindmap || "",
      cheatsheet: raw.cheat_sheet || raw.cheatsheet || "",
      flashcards: raw.flashcards || [],
      mcqs: raw.mcqs || [],
      important: raw.important_questions || raw.important || [],
      notes: raw.notes || null,
      dpp_subtopics: raw.dpp_subtopics || [],
    };
  },
};

let activeTransport: StudyTransportAdapter = defaultHttpAdapter;

/**
 * Seam interceptor: swap transport for unit tests or offline local packs
 */
export function setStudyTransportAdapter(adapter: StudyTransportAdapter): void {
  activeTransport = adapter;
}

// ── High-Leverage Query Interface ────────────────────────────────────────────

export async function getPYQs(cacheKey: string, chapterCode: string): Promise<PYQResponse> {
  const cacheId = `pyq_${cacheKey}_${chapterCode}`;
  const cached = readCached<PYQResponse>(cacheId);
  if (cached) return cached;

  if (inFlightRequests.has(cacheId)) {
    return inFlightRequests.get(cacheId)!;
  }

  const req = activeTransport.fetchPYQs(cacheKey, chapterCode)
    .then((data) => {
      writeCached(cacheId, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheId);
    });

  inFlightRequests.set(cacheId, req);
  return req;
}

export async function getChapterKit(cacheKey: string, chapterCode: string): Promise<ChapterKitData> {
  const cacheId = `kit_${cacheKey}_${chapterCode}`;
  const cached = readCached<ChapterKitData>(cacheId);
  if (cached) return cached;

  if (inFlightRequests.has(cacheId)) {
    return inFlightRequests.get(cacheId)!;
  }

  const req = activeTransport.fetchChapterKit(cacheKey, chapterCode)
    .then((data) => {
      writeCached(cacheId, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheId);
    });

  inFlightRequests.set(cacheId, req);
  return req;
}

/**
 * High-leverage bundle query: loads both PYQs and Kit data in parallel,
 * handling board class gating and error isolation so callers don't need
 * duplicate Promise.allSettled state machines.
 */
export async function loadChapterStudyBundle(
  cacheKey: string,
  chapterCode: string,
  isBoard: boolean
): Promise<ChapterStudyBundle> {
  let pyq: PYQResponse | null = null;
  let kit: ChapterKitData | null = null;
  let error: string | null = null;

  const promises: Promise<any>[] = [
    getChapterKit(cacheKey, chapterCode)
      .then((k) => { kit = k; })
      .catch((err) => { error = err?.message || "Failed to load study kit"; }),
  ];

  if (isBoard) {
    promises.push(
      getPYQs(cacheKey, chapterCode)
        .then((p) => { pyq = p; })
        .catch((err) => {
          if (!error) error = err?.message || "Failed to load PYQs";
        })
    );
  }

  await Promise.allSettled(promises);
  return { pyq, kit, error };
}

// ── Bookmark State Management (Locality) ────────────────────────────────────

export function getBookmarkedPYQs(): PYQQuestion[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isPYQBookmarked(q: PYQQuestion): boolean {
  const all = getBookmarkedPYQs();
  return all.some(
    (item) =>
      item.chapter_code === q.chapter_code &&
      item.q_num === q.q_num &&
      item.year === q.year
  );
}

export function toggleBookmarkPYQ(q: PYQQuestion): boolean {
  const all = getBookmarkedPYQs();
  const index = all.findIndex(
    (item) =>
      item.chapter_code === q.chapter_code &&
      item.q_num === q.q_num &&
      item.year === q.year
  );

  if (index >= 0) {
    all.splice(index, 1);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
    } catch {
      // Storage unavailable
    }
    return false;
  } else {
    all.unshift(q);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
    } catch {
      // Storage unavailable
    }
    return true;
  }
}

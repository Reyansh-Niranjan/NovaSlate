/**
 * Deep Module: CurriculumCatalog
 * Encapsulates catalog indexing, stream hierarchy resolution, fuzzy code
 * matching, and storage URL generation behind a concise query interface.
 */

import {
  STUDYOS_CATALOG,
  CLASS_SUBJECT_ORDERS,
  STREAM_SUBJECT_ORDERS,
  isBoardClass as checkIsBoardClass,
} from "./studyosCatalog.ts";
import type {
  SubjectData,
  ChapterItem,
  ClassNumber,
  StreamKey,
} from "./studyosCatalog.ts";

export type { SubjectData, ChapterItem, ClassNumber, StreamKey };

export interface BookMatch {
  subject: SubjectData;
  chapters: ChapterItem[];
  activeChapter?: ChapterItem;
}

export interface SubjectSummary {
  cacheKey: string;
  label: string;
  icon: string;
  chapterCount: number;
  data: SubjectData;
}

export const IA_BUCKET = "novaslate-ncert-library";

/**
 * Normalizes and produces safe Internet Archive URLs for NCERT files
 */
export function getInternetArchiveUrl(fullPath: string): string {
  const clean = fullPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const safe = clean.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return `https://archive.org/download/${IA_BUCKET}/${safe}`;
}

export function isBoardClass(classNum: string | number): boolean {
  return checkIsBoardClass(classNum);
}

/**
 * Returns all flattened chapters for a given subject safely
 */
export function getSubjectChapters(subj?: SubjectData | null): ChapterItem[] {
  if (!subj) return [];
  if (subj.chapters && subj.chapters.length > 0) return subj.chapters;
  if (subj.groups && subj.groups.length > 0) {
    return subj.groups.flatMap((g) => g.chapters || []);
  }
  return [];
}

/**
 * Resolves a subject definition by its unique cache key
 */
export function getSubject(cacheKey: string): SubjectData | undefined {
  return STUDYOS_CATALOG[cacheKey];
}

/**
 * Resolves ordered subjects for a given grade and optional stream
 */
export function getSubjectListForClass(
  classNum: string,
  stream: StreamKey = "all"
): SubjectSummary[] {
  const cleanClass = classNum.replace(/\D/g, "");
  const streamMap = STREAM_SUBJECT_ORDERS[cleanClass];
  const keys = streamMap?.[stream] || CLASS_SUBJECT_ORDERS[cleanClass] || [];

  const list: SubjectSummary[] = [];
  for (const key of keys) {
    const subj = STUDYOS_CATALOG[key];
    if (subj) {
      list.push({
        cacheKey: key,
        label: subj.label,
        icon: subj.icon,
        chapterCount: getSubjectChapters(subj).length,
        data: subj,
      });
    }
  }
  return list;
}

// In-memory memoization cache for book resolution to eliminate repeated regex scans
const matchCache = new Map<string, BookMatch | null>();

/**
 * High-leverage book resolver: maps arbitrary textbook paths or titles to
 * canonical StudyOS Subject and Chapter items.
 */
export function resolveBookMatch(
  fullPathOrTitle: string,
  classNum?: string,
  subjectName?: string
): BookMatch | null {
  const cacheKey = `${fullPathOrTitle}::${classNum || ""}::${subjectName || ""}`;
  if (matchCache.has(cacheKey)) {
    return matchCache.get(cacheKey)!;
  }

  const lower = fullPathOrTitle.toLowerCase();

  // 1. Direct NCERT code extraction (e.g. jesc1, jemh1, leph1, lech1, eemm1, fesc1, etc.)
  const codeMatch = lower.match(/([a-z]{4,5}\d{1,3})/);
  if (codeMatch) {
    const rawCode = codeMatch[1];
    for (const subj of Object.values(STUDYOS_CATALOG)) {
      const allChapters = getSubjectChapters(subj);
      const active = allChapters.find(
        (c) =>
          c.code.toLowerCase() === rawCode.toLowerCase() ||
          rawCode.toLowerCase().startsWith(c.code.toLowerCase().slice(0, 4))
      );
      if (active) {
        const result: BookMatch = {
          subject: subj,
          chapters: allChapters,
          activeChapter: active,
        };
        matchCache.set(cacheKey, result);
        return result;
      }
    }
  }

  // 2. Match by Class & Subject
  let targetClass = classNum?.replace(/[^0-9]/g, "") || "";
  if (!targetClass) {
    const clsMatch = lower.match(/class\s*(\d+)/);
    if (clsMatch) targetClass = clsMatch[1];
  }

  for (const [key, subj] of Object.entries(STUDYOS_CATALOG)) {
    const isMatchingClass =
      (!targetClass && !key.startsWith("c")) ||
      (targetClass === "10" && !key.startsWith("c")) ||
      (targetClass && key.startsWith(`c${targetClass}_`));

    if (!isMatchingClass) continue;

    const subjClean = subj.label.toLowerCase();
    const querySubj = (subjectName || "").toLowerCase();

    if (
      (querySubj && (subjClean.includes(querySubj) || querySubj.includes(subjClean))) ||
      lower.includes(subjClean) ||
      (subjClean === "mathematics" && lower.includes("math")) ||
      (subjClean === "science" && lower.includes("science"))
    ) {
      const allChapters = getSubjectChapters(subj);
      let active: ChapterItem | undefined;
      for (const ch of allChapters) {
        if (
          lower.includes(ch.name.toLowerCase()) ||
          ch.name.toLowerCase().includes(lower)
        ) {
          active = ch;
          break;
        }
      }

      const result: BookMatch = {
        subject: subj,
        chapters: allChapters,
        activeChapter: active || allChapters[0],
      };
      matchCache.set(cacheKey, result);
      return result;
    }
  }

  matchCache.set(cacheKey, null);
  return null;
}

/**
 * Compatibility Adapter: studyos.ts
 * Delegates all catalog resolution to CurriculumCatalog and all
 * study kit / PYQ caching and fetching to StudyKitStore.
 */

export * from "./studyKitStore.ts";
export {
  resolveBookMatch as findChaptersForBook,
  getSubjectChapters,
  getInternetArchiveUrl,
  isBoardClass,
  IA_BUCKET,
} from "./curriculumCatalog.ts";
export type {
  BookMatch,
  SubjectSummary,
} from "./curriculumCatalog.ts";

// Re-export specific legacy named functions
import {
  getPYQs,
  getChapterKit,
} from "./studyKitStore.ts";

export const fetchPYQs = getPYQs;
export const fetchChapterKit = getChapterKit;

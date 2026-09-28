import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Star,
  Heart,
  ArrowRight,
  Search,
} from "lucide-react";

/* =========================================================================
   TYPES & DATA (Sameerkhan9412/StudyByte)
   ========================================================================= */

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  notesSummary: string;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  grade: string;
  subject: string;
  rating: number;
  reviewsCount: number;
  enrolled: boolean;
  thumbnailUrl: string;
  description: string;
  modules: CourseModule[];
}

const INITIAL_COURSES: Course[] = [
  {
    id: "course_c10_sprint",
    title: "Class 10 Board Accelerator: Science & Mathematics",
    instructor: "Dr. Arvind Rao",
    grade: "Class 10",
    subject: "Science & Math",
    rating: 4.9,
    reviewsCount: 342,
    enrolled: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    description:
      "Comprehensive chapter-by-chapter mastery covering NCERT Physics, Chemistry, Biology and Class 10 Standard Mathematics with past 10-year board questions.",
    modules: [
      {
        id: "mod_1",
        title: "Module 1: Chemical Reactions & Equations",
        lessons: [
          {
            id: "les_1_1",
            title: "Types of Reactions & Balancing Equations",
            duration: "24 mins",
            notesSummary:
              "Deals with synthesis, decomposition, displacement, double displacement, and oxidation-reduction reactions. Conservation of mass principle.",
            completed: true,
          },
          {
            id: "les_1_2",
            title: "Corrosion and Rancidity Prevention",
            duration: "18 mins",
            notesSummary:
              "Oxidation of iron (rusting) requires moisture and oxygen. Antioxidants and nitrogen flushing preserve fatty foods.",
            completed: true,
          },
        ],
      },
      {
        id: "mod_2",
        title: "Module 2: Light - Reflection and Refraction",
        lessons: [
          {
            id: "les_2_1",
            title: "Spherical Mirrors & Mirror Formula Derivation",
            duration: "32 mins",
            notesSummary:
              "Concave vs convex mirror ray diagrams. 1/v + 1/u = 1/f and magnification m = -v/u. Sign conventions.",
            completed: false,
          },
          {
            id: "les_2_2",
            title: "Lens Formula & Power of Lenses",
            duration: "28 mins",
            notesSummary:
              "Lens maker fundamentals, refractive index n21 = v1/v2, P = 1/f (in meters, unit: Dioptres).",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "course_c12_physics",
    title: "Class 12 Physics: Electromagnetism & Optics",
    instructor: "Er. Priya Sundaram",
    grade: "Class 12",
    subject: "Physics",
    rating: 4.8,
    reviewsCount: 218,
    enrolled: false,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=600&q=80",
    description:
      "Deep conceptual grounding from Coulomb's Law and Gauss's Theorem to electromagnetic wave propagation and wave optics.",
    modules: [
      {
        id: "mod_p1",
        title: "Module 1: Electrostatics & Potential",
        lessons: [
          {
            id: "les_p1_1",
            title: "Electric Flux & Gauss Law Proof",
            duration: "36 mins",
            notesSummary: "Derivation of electric field due to infinitely long charged wire and thin spherical shell.",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "course_found_cs",
    title: "Computational Thinking & Python for School Scholars",
    instructor: "Reyansh Niranjan",
    grade: "Class 9-12",
    subject: "Computer Science",
    rating: 5.0,
    reviewsCount: 184,
    enrolled: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
    description:
      "Learn procedural logic, data structures, algorithm efficiency, and embedded programming for the NovaSlate Atlas ESP32 micro-device.",
    modules: [
      {
        id: "mod_cs1",
        title: "Module 1: Core Algorithms & Data Structures",
        lessons: [
          {
            id: "les_cs1",
            title: "Loops, Recursion and Asymptotic Complexity",
            duration: "30 mins",
            notesSummary: "Big-O analysis, binary search vs linear search, stack recursion frames.",
            completed: true,
          },
        ],
      },
    ],
  },
];

type CoursesTab = "catalog" | "player" | "studio";

export const StudyByteCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("novaslate_courses_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_COURSES;
  });

  const [activeTab, setActiveTab] = useState<CoursesTab>("catalog");
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(
    courses[0].modules[0]?.lessons[0] || {
      id: "def",
      title: "Introduction",
      duration: "10 mins",
      notesSummary: "Course outline",
      completed: false,
    }
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null);

  // Instructor Studio Form
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseGrade, setNewCourseGrade] = useState("Class 10");
  const [newCourseSubject, setNewCourseSubject] = useState("Mathematics");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  // Persist courses to localStorage
  useEffect(() => {
    localStorage.setItem("novaslate_courses_data", JSON.stringify(courses));
  }, [courses]);

  // Handle Lesson Completion
  const handleToggleLessonComplete = (lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCourse.id) return c;
        const updatedMods = c.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l)),
        }));
        const updatedCourse = { ...c, modules: updatedMods };
        setSelectedCourse(updatedCourse);
        return updatedCourse;
      })
    );
  };

  // Instant Free Enrollment (StudyByte)
  const handleEnrollCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c))
    );
    const target = courses.find((c) => c.id === courseId);
    setEnrollmentNotice(`Enrolled successfully in "${target?.title || "Course"}"!`);
    setTimeout(() => setEnrollmentNotice(null), 4000);
  };

  const handleToggleWishlist = (courseId: string) => {
    setWishlist((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Instructor Create Course (StudyByte)
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: newCourseTitle.trim(),
      instructor: "Reyansh Niranjan (You)",
      grade: newCourseGrade,
      subject: newCourseSubject,
      rating: 5.0,
      reviewsCount: 1,
      enrolled: true,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      description: newCourseDesc.trim() || "Structured modular curriculum with practice sheets.",
      modules: [
        {
          id: `mod_${Date.now()}`,
          title: "Module 1: Orientation and Foundations",
          lessons: [
            {
              id: `les_${Date.now()}`,
              title: "Lesson 1: Key Principles and Prerequisites",
              duration: "20 mins",
              notesSummary: "Foundational overview of fundamental axioms and definitions.",
              completed: false,
            },
          ],
        },
      ],
    };

    setCourses((prev) => [newCourse, ...prev]);
    setSelectedCourse(newCourse);
    setNewCourseTitle("");
    setNewCourseDesc("");
    setActiveTab("catalog");
  };

  // Calculate course completion percentage
  const totalLessons = selectedCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = selectedCourse.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
    0
  );
  const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === "All" || c.grade.includes(selectedGrade);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Notice */}
      <AnimatePresence>
        {enrollmentNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{enrollmentNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setEnrollmentNotice(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[11px] font-mono uppercase tracking-wider text-muted-foreground border border-border/70">
            <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
            <span>StudyByte LMS Platform (Sameerkhan9412)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-normal tracking-[-0.02em] text-foreground">
            Curriculum Courses &amp; Learning Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-body leading-relaxed">
            Modular video lectures, synchronized lesson progress verification, and instructor course creation studio.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-secondary/80 rounded-2xl border border-border/70 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "catalog"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Course Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("player")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "player"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Course Player
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "studio"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Instructor Studio
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. COURSE CATALOG (StudyByte)
          ===================================================================== */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Search & Grade Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by topic, teacher, or subject..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-muted-foreground">Grade:</span>
              {["All", "Class 10", "Class 12"].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    selectedGrade === grade
                      ? "bg-foreground text-background font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => {
              const isWishlisted = wishlist.includes(c.id);

              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between shadow-xs transition-all hover:border-foreground/40"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-zinc-950">
                      <img
                        src={c.thumbnailUrl}
                        alt={c.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white border border-white/10">
                        {c.grade} · {c.subject}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(c.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-xs text-white border border-white/10 hover:text-rose-400 transition-colors"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono text-[11px]">{c.instructor}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-mono text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{c.rating}</span>
                          <span className="text-muted-foreground">({c.reviewsCount})</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-heading font-medium text-foreground line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-body">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-500 font-medium">
                      Open Educational Resource
                    </span>

                    {c.enrolled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(c);
                          if (c.modules[0]?.lessons[0]) {
                            setActiveLesson(c.modules[0].lessons[0]);
                          }
                          setActiveTab("player");
                        }}
                        className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <span>Open Course</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnrollCourse(c.id)}
                        className="px-4 py-2 rounded-xl border border-border hover:bg-secondary text-xs font-medium text-foreground transition-all active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <span>Enroll Course</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. INTERACTIVE COURSE PLAYER & LESSONS (StudyByte)
          ===================================================================== */}
      {activeTab === "player" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Lesson Viewport */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl border border-border/80 bg-zinc-950 p-6 min-h-[360px] flex flex-col justify-between text-white shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {selectedCourse.title}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                  {activeLesson.duration}
                </span>
              </div>

              {/* Lecture Screen Simulation */}
              <div className="my-auto py-8 text-center space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white cursor-pointer hover:scale-105 transition-transform">
                  <Play className="h-7 w-7 fill-current ml-1" />
                </div>
                <h2 className="text-lg sm:text-xl font-heading font-medium text-white">
                  {activeLesson.title}
                </h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Interactive lecture stream with synchronized checkpoints and board derivations.
                </p>
              </div>

              {/* Player Progress Bar */}
              <div className="space-y-2 z-10">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Course Progress: {completedLessons}/{totalLessons} Lessons</span>
                  <span>{percentComplete}% Complete</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lesson Summary & Checkmark */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-medium text-foreground">
                  Lecture Revision Notes &amp; Formulas
                </h3>
                <button
                  type="button"
                  onClick={() => handleToggleLessonComplete(activeLesson.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                    activeLesson.completed
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{activeLesson.completed ? "Completed" : "Mark Complete"}</span>
                </button>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-body">
                {activeLesson.notesSummary}
              </p>
            </div>
          </div>

          {/* Course Curriculum Drawer */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
              <div className="border-b border-border/80 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Curriculum Breakdown
                </span>
                <h3 className="text-sm font-heading font-medium text-foreground mt-0.5">
                  Course Modules
                </h3>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {selectedCourse.modules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground font-mono">{mod.title}</h4>
                    <div className="space-y-1.5">
                      {mod.lessons.map((les) => {
                        const isActive = activeLesson.id === les.id;

                        return (
                          <div
                            key={les.id}
                            onClick={() => setActiveLesson(les)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isActive
                                ? "border-foreground bg-secondary/80 font-medium text-foreground"
                                : "border-border/60 hover:border-border hover:bg-secondary/40 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  les.completed ? "bg-emerald-500" : "bg-zinc-400"
                                }`}
                              />
                              <span className="line-clamp-1">{les.title}</span>
                            </div>
                            <span className="font-mono text-[10px] shrink-0 text-muted-foreground">
                              {les.duration}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. INSTRUCTOR STUDIO & COURSE PUBLISHING (StudyByte)
          ===================================================================== */}
      {activeTab === "studio" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Instructor Console
              </span>
              <h2 className="text-xl font-heading font-medium text-foreground mt-1">
                Publish a New Course Module
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Upload curriculum materials, formulate learning objectives, and publish to the NovaSlate community.
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Class 11 Organic Chemistry Reactions"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newCourseGrade}
                    onChange={(e) => setNewCourseGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseSubject}
                    onChange={(e) => setNewCourseSubject(e.target.value)}
                    placeholder="e.g. Chemistry"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Course Description &amp; Objectives
                </label>
                <textarea
                  rows={3}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Summarize course pedagogy and target exam focus..."
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

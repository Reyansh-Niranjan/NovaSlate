import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Search,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Brain,
  Cpu,
  Zap,
} from "lucide-react";

/* =========================================================================
   TYPES & KNOWLEDGE BASE DATA (Kaju-Open-Source/ORE + CaviraOSS/PageLM)
   ========================================================================= */

export interface KnowledgeDocument {
  id: string;
  title: string;
  grade: string;
  subject: string;
  chapter: string;
  content: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  mastery: "new" | "learning" | "mastered";
}

export interface PodcastDialogue {
  speaker: "Alex" | "Maya";
  text: string;
  timeSec: number;
}

const DEFAULT_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "ore_c10_chem_01",
    title: "Chemical Reactions and Equations",
    grade: "Class 10",
    subject: "Science",
    chapter: "Chapter 1",
    tags: ["reactions", "balancing", "oxidation", "redox", "exothermic"],
    content:
      "A chemical reaction involves breaking of old chemical bonds and formation of new bonds to produce substances with entirely new chemical properties. In a balanced chemical equation, the total mass of reactants equals the total mass of products, following the Law of Conservation of Mass. Combustion of magnesium in oxygen yields magnesium oxide (2Mg + O2 -> 2MgO), accompanied by a dazzling white flame. Decomposition reactions require energy in the form of heat, light, or electricity to break down a single reactant into simpler compounds.",
  },
  {
    id: "ore_c10_phys_10",
    title: "Light - Reflection and Refraction",
    grade: "Class 10",
    subject: "Physics",
    chapter: "Chapter 10",
    tags: ["optics", "mirrors", "lenses", "snell's law", "refraction"],
    content:
      "Light travels in straight lines in a homogeneous medium. The laws of reflection state that the angle of incidence equals the angle of reflection, and the incident ray, reflected ray, and normal all lie in the same plane. Concave mirrors produce real and inverted images for objects placed beyond the focal point, while convex mirrors consistently form virtual, erect, and diminished images with a broad field of view. Snell's law governs refraction: sin(i) / sin(r) = constant (refractive index n21).",
  },
  {
    id: "ore_c10_bio_06",
    title: "Life Processes - Nutrition and Respiration",
    grade: "Class 10",
    subject: "Biology",
    chapter: "Chapter 6",
    tags: ["photosynthesis", "enzymes", "atp", "respiration", "chlorophyll"],
    content:
      "Autotrophic nutrition relies on photosynthesis where carbon dioxide and water are converted into carbohydrates in the presence of sunlight and chlorophyll (6CO2 + 12H2O -> C6H12O6 + 6O2 + 6H2O). Cellular respiration breaks down glucose via glycolysis into pyruvate in the cytoplasm, yielding ATP. Aerobic respiration in mitochondria breaks down pyruvate into CO2, H2O, and 36-38 ATP molecules, whereas anaerobic fermentation in yeast generates ethanol and CO2 with 2 ATP.",
  },
  {
    id: "ore_c12_phys_01",
    title: "Electric Charges and Fields",
    grade: "Class 12",
    subject: "Physics",
    chapter: "Chapter 1",
    tags: ["electrostatics", "coulomb's law", "gauss theorem", "flux", "dipole"],
    content:
      "Electric charge is quantized (q = ne) and conserved. Coulomb's Law quantifies the electrostatic force between two stationary point charges: F = (1 / 4πε0) * (q1 * q2 / r^2). Gauss's Law asserts that the total electric flux through any closed Gaussian surface equals the net charge enclosed divided by ε0: ∮ E·dA = q_enclosed / ε0. An electric dipole consists of two equal and opposite charges separated by distance 2a, having dipole moment p = q * 2a.",
  },
  {
    id: "ore_c10_math_08",
    title: "Introduction to Trigonometry",
    grade: "Class 10",
    subject: "Mathematics",
    chapter: "Chapter 8",
    tags: ["trigonometry", "sin cos tan", "identities", "right triangle"],
    content:
      "Trigonometric ratios quantify relationships between sides and angles of a right-angled triangle. Sin(θ) = Opposite / Hypotenuse, Cos(θ) = Adjacent / Hypotenuse, Tan(θ) = Sin(θ) / Cos(θ). The three fundamental Pythagorean trigonometric identities are: sin^2(θ) + cos^2(θ) = 1, 1 + tan^2(θ) = sec^2(θ), and 1 + cot^2(θ) = cosec^2(θ). These identities hold for all angle values 0° <= θ <= 90°.",
  },
];

const SAMPLE_QUIZZES: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: "q1",
      question: "Which law dictates that chemical equations must be balanced in stoichiometry?",
      options: [
        "Law of Conservation of Mass",
        "Law of Definite Proportions",
        "Avogadro's Principle",
        "Boyle's Ideal Gas Law",
      ],
      correctIndex: 0,
      explanation:
        "Matter can neither be created nor destroyed in a chemical reaction. Hence, the number of atoms of each element remains identical before and after reaction.",
    },
    {
      id: "q2",
      question: "What is the nature of the image formed by a convex mirror for any real object position?",
      options: [
        "Real, inverted, and magnified",
        "Virtual, erect, and diminished",
        "Real, erect, and same size",
        "Virtual, inverted, and magnified",
      ],
      correctIndex: 1,
      explanation:
        "Convex mirrors always form virtual, erect, and diminished images behind the mirror, offering a wider panoramic field of view.",
    },
    {
      id: "q3",
      question: "During cellular respiration, in which cellular compartment does glycolysis occur?",
      options: ["Mitochondrial Matrix", "Cytoplasm", "Endoplasmic Reticulum", "Nucleolus"],
      correctIndex: 1,
      explanation:
        "Glycolysis is the anaerobic conversion of 1 glucose molecule into 2 pyruvate molecules occurring purely in the cytoplasm.",
    },
    {
      id: "q4",
      question: "According to Gauss's Law, what is the electric flux through a closed surface containing zero net charge?",
      options: ["Zero", "q / ε0", "Infinite", "Dependent on surface radius"],
      correctIndex: 0,
      explanation:
        "Gauss's law states ∮ E·dA = q_enclosed / ε0. If net enclosed charge is zero, net outward electric flux is exactly zero.",
    },
    {
      id: "q5",
      question: "Which of the following is equivalent to 1 + tan²(θ)?",
      options: ["cosec²(θ)", "sec²(θ)", "cot²(θ)", "sin²(θ)"],
      correctIndex: 1,
      explanation:
        "From sin²(θ) + cos²(θ) = 1, dividing through by cos²(θ) yields tan²(θ) + 1 = sec²(θ).",
    },
  ],
};

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "fc_1",
    front: "What is Snell's Law of Refraction?",
    back: "sin(i) / sin(r) = n21, where n21 is the refractive index of medium 2 with respect to medium 1.",
    subject: "Physics",
    mastery: "learning",
  },
  {
    id: "fc_2",
    front: "Write the general balanced equation for photosynthesis.",
    back: "6CO2 + 12H2O --(sunlight/chlorophyll)--> C6H12O6 + 6O2 + 6H2O",
    subject: "Biology",
    mastery: "mastered",
  },
  {
    id: "fc_3",
    front: "State Coulomb's Law formula for electrostatics.",
    back: "F = (1 / 4πε0) * (|q1 * q2| / r²), directed along the line joining the two charges.",
    subject: "Physics",
    mastery: "new",
  },
  {
    id: "fc_4",
    front: "What are the three fundamental Pythagorean trigonometric identities?",
    back: "1. sin²θ + cos²θ = 1\n2. 1 + tan²θ = sec²θ\n3. 1 + cot²θ = cosec²θ",
    subject: "Mathematics",
    mastery: "mastered",
  },
  {
    id: "fc_5",
    front: "Define Redox reaction with an example.",
    back: "A reaction where oxidation (loss of electrons) and reduction (gain of electrons) happen simultaneously. Example: CuO + H2 -> Cu + H2O.",
    subject: "Chemistry",
    mastery: "learning",
  },
];

const SAMPLE_PODCAST: PodcastDialogue[] = [
  {
    speaker: "Alex",
    text: "Welcome back to NovaSlate Deep Dive! Today we're breaking down one of the most core concepts in science: Light and Refraction.",
    timeSec: 0,
  },
  {
    speaker: "Maya",
    text: "That's right, Alex. When a pencil looks bent inside a glass of water, you are witnessing refraction in real time. Light changes speed as it enters a denser medium.",
    timeSec: 6,
  },
  {
    speaker: "Alex",
    text: "Exactly. Snell's law quantifies that: the ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media.",
    timeSec: 13,
  },
  {
    speaker: "Maya",
    text: "And think about lenses too! Concave lenses always disperse light rays and produce virtual, upright images. Perfect for correcting myopia or nearsightedness.",
    timeSec: 21,
  },
  {
    speaker: "Alex",
    text: "Pro tip for exams: remember that ray diagrams always require arrow directions on rays. Missing arrows costs easy marks!",
    timeSec: 29,
  },
  {
    speaker: "Maya",
    text: "Great point! Review the flashcards in NovaSlate right after this episode to lock in your definitions.",
    timeSec: 36,
  },
];

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

type StudioTab = "rag" | "quiz" | "flashcards" | "podcast";

export const PageLMStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>("rag");

  // RAG Search States (Kaju-Open-Source/ORE)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeDocument[]>(DEFAULT_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument>(DEFAULT_DOCUMENTS[0]);

  // Custom Ingestion State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocSubject, setNewDocSubject] = useState("Science");
  const [newDocContent, setNewDocContent] = useState("");

  // Quiz States (CaviraOSS/PageLM)
  const [quizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZZES.default);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Flashcards States
  const [flashcards, setFlashcards] = useState<Flashcard[]>(SAMPLE_FLASHCARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Podcast States
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcastIndex, setPodcastIndex] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  // ORE RAG Search Logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    setTimeout(() => {
      if (!query.trim()) {
        setSearchResults(DEFAULT_DOCUMENTS);
        return;
      }
      const q = query.toLowerCase();
      const filtered = DEFAULT_DOCUMENTS.filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          doc.content.toLowerCase().includes(q) ||
          doc.tags.some((t) => t.toLowerCase().includes(q)) ||
          doc.subject.toLowerCase().includes(q)
      );
      setSearchResults(filtered);
      if (filtered.length > 0) {
        setSelectedDoc(filtered[0]);
      }
    }, 150);
  };

  // Add Document to Knowledge Base
  const handleIngestDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const newDoc: KnowledgeDocument = {
      id: `doc_${Date.now()}`,
      title: newDocTitle.trim(),
      grade: "Custom",
      subject: newDocSubject,
      chapter: "User Ingestion",
      tags: ["custom", newDocSubject.toLowerCase()],
      content: newDocContent.trim(),
    };

    DEFAULT_DOCUMENTS.unshift(newDoc);
    setSearchResults([...DEFAULT_DOCUMENTS]);
    setSelectedDoc(newDoc);
    setShowIngestModal(false);
    setNewDocTitle("");
    setNewDocContent("");
  };

  // Quiz submission & score calculation
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [qId, ans]) => {
    const q = quizQuestions.find((item) => item.id === qId);
    return q && q.correctIndex === ans ? acc + 1 : acc;
  }, 0);

  // Flashcards navigation & rating
  const handleRateCard = (rating: "new" | "learning" | "mastered") => {
    setFlashcards((prev) =>
      prev.map((c, i) => (i === currentCardIndex ? { ...c, mastery: rating } : c))
    );
    setIsFlipped(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  // Web Speech API Podcast Playback
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const speakLine = (index: number) => {
    if (!speechSupported || index >= SAMPLE_PODCAST.length) {
      setIsPlaying(false);
      return;
    }
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    synth.cancel();

    const line = SAMPLE_PODCAST[index];
    setPodcastIndex(index);
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.rate = 1.0;
    utterance.pitch = line.speaker === "Maya" ? 1.15 : 0.95;

    utterance.onend = () => {
      if (index + 1 < SAMPLE_PODCAST.length) {
        speakLine(index + 1);
      } else {
        setIsPlaying(false);
        setPodcastIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synth.speak(utterance);
  };

  const handleTogglePodcast = () => {
    if (!speechSupported) return;
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakLine(podcastIndex);
    }
  };

  const handleResetPodcast = () => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPodcastIndex(0);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[11px] font-mono uppercase tracking-wider text-muted-foreground border border-border/70">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Knowledge &amp; Study Engine</span>
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/80 font-medium">PageLM × ORE RAG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-normal tracking-[-0.02em] text-foreground">
            Curriculum Intelligence &amp; Active Synthesis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-body leading-relaxed">
            Instant semantic document search across textbooks, automated concept quizzes, spaced-repetition flashcards, and synthetic two-host audio study podcasts.
          </p>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-secondary/80 rounded-2xl border border-border/70 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("rag")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "rag"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>ORE Search</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>AI Quizzes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "flashcards"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Flashcards</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("podcast")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "podcast"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Audio Podcast</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. ORE SEMANTIC RAG KNOWLEDGE REPOSITORY
          ===================================================================== */}
      {activeTab === "rag" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Search input and indexed documents list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  ORE Vector Index ({searchResults.length} docs)
                </span>
                <button
                  type="button"
                  onClick={() => setShowIngestModal(true)}
                  className="text-xs font-medium text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>Ingest Document</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Ask or search curriculum concepts..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              {/* Document List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {searchResults.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedDoc.id === doc.id
                        ? "border-foreground/80 bg-secondary/70 shadow-xs"
                        : "border-border/60 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                        {doc.grade} · {doc.subject}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">{doc.chapter}</span>
                    </div>
                    <h3 className="text-xs font-medium text-foreground line-clamp-1">{doc.title}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                      {doc.content}
                    </p>
                  </div>
                ))}

                {searchResults.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No matching documents in the vector index. Try another query or ingest a new document.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Document Inspector & Contextual Synthesis */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {selectedDoc.grade} · {selectedDoc.subject} · {selectedDoc.chapter}
                    </span>
                    <h2 className="text-lg font-heading font-medium text-foreground mt-0.5">
                      {selectedDoc.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedDoc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-xs text-foreground/90 leading-relaxed font-body">
                  <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 mb-4">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Cpu className="h-3 w-3 text-emerald-500" />
                      <span>RAG Context Preview</span>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground">{selectedDoc.content}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-foreground uppercase tracking-wider font-mono">
                      Key Takeaways &amp; Exam Checklist
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground text-xs">
                      <li>Understand core terminology, law definitions, and governing boundary conditions.</li>
                      <li>Review balanced chemical or mathematical equations for exact stoichiometric/algebraic parity.</li>
                      <li>Formulate sample practice questions using the AI Quiz Generator tab.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px]">Indexed via ORE Embedding Pipeline</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("quiz")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <span>Generate Quiz from Document</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. CAVIRA PAGE-LM AI QUIZ GENERATOR
          ===================================================================== */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-medium text-foreground">
                Interactive Concept Mastery Quiz
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                Answer each prompt to validate your conceptual grounding. Explanations unlock upon submission.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {showResults && (
                <div className="px-3 py-1.5 rounded-xl bg-secondary font-mono text-xs font-medium text-foreground">
                  Score: {score} / {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (showResults) {
                    setSelectedAnswers({});
                    setShowResults(false);
                  } else {
                    setShowResults(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                {showResults ? "Try Again" : "Submit Answers"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizQuestions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isAnswered = selected !== undefined;
              const isCorrect = selected === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      Question {idx + 1}
                    </span>
                    {showResults && isAnswered && (
                      <span
                        className={`text-xs font-mono font-medium flex items-center gap-1 ${
                          isCorrect ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-medium text-foreground font-body">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selected === optIdx;
                      let btnStyle = "border-border/70 hover:border-foreground/40 bg-background";

                      if (isChosen) {
                        btnStyle = "border-foreground bg-secondary/80 font-medium text-foreground";
                      }
                      if (showResults) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border border-current shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border text-[11px] text-muted-foreground leading-relaxed mt-2">
                      <span className="font-semibold text-foreground font-mono mr-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          3. SPACED REPETITION FLASHCARDS (CaviraOSS/PageLM)
          ===================================================================== */}
      {activeTab === "flashcards" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>
              Card {currentCardIndex + 1} of {flashcards.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground">
              {flashcards[currentCardIndex].subject}
            </span>
          </div>

          {/* Flashcard Flip Stage */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[260px] rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between items-center text-center shadow-xs transition-all hover:border-foreground/40"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {isFlipped ? "Answer" : "Question (Click to flip)"}
            </div>

            <div className="my-auto py-4">
              <p className="text-base sm:text-lg font-heading font-medium text-foreground leading-relaxed">
                {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
              </p>
            </div>

            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <RotateCcw className="h-3 w-3" />
              <span>Tap anywhere to reveal</span>
            </div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleRateCard("new")}
              className="px-4 py-2 rounded-xl border border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-medium text-rose-500 transition-all active:scale-[0.98]"
            >
              Hard (Repeat)
            </button>
            <button
              type="button"
              onClick={() => handleRateCard("learning")}
              className="px-4 py-2 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/10 text-xs font-medium text-amber-500 transition-all active:scale-[0.98]"
            >
              Good
            </button>
            <button
              type="button"
              onClick={() => handleRateCard("mastered")}
              className="px-4 py-2 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs font-medium text-emerald-500 transition-all active:scale-[0.98]"
            >
              Easy (Mastered)
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. AI AUDIO PODCAST & SYNTHESIS (CaviraOSS/PageLM)
          ===================================================================== */}
      {activeTab === "podcast" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Episode 01 · 2-Host AI Podcast
                </span>
                <h2 className="text-xl font-heading font-medium text-foreground mt-1">
                  Optics, Light &amp; The Geometry of Vision
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Synthesized co-host discussion between Alex (Theory Lead) and Maya (Exam Coach).
                </p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetPodcast}
                  className="p-2.5 rounded-full border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95"
                  title="Reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleTogglePodcast}
                  className="px-5 py-2.5 rounded-full bg-foreground text-background flex items-center gap-2 text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98] shadow-xs"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Podcast</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Play Podcast</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transcript with live dialogue sync */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {SAMPLE_PODCAST.map((item, index) => {
                const isActive = isPlaying && index === podcastIndex;
                const isAlex = item.speaker === "Alex";

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (speechSupported) {
                        speakLine(index);
                        setIsPlaying(true);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "border-foreground bg-secondary/80 shadow-xs"
                        : "border-border/60 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAlex ? "bg-blue-500" : "bg-purple-500"
                          } ${isActive ? "animate-ping" : ""}`}
                        />
                        <span className="text-xs font-mono font-medium text-foreground">
                          {item.speaker}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        00:{item.timeSec < 10 ? `0${item.timeSec}` : item.timeSec}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed font-body">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Ingest Document Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-medium text-foreground">
                Ingest Document into ORE RAG Index
              </h3>
              <button
                type="button"
                onClick={() => setShowIngestModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleIngestDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Electromagnetic Induction Notes"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Subject
                </label>
                <select
                  value={newDocSubject}
                  onChange={(e) => setNewDocSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Content / Summary Text
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Paste textbook excerpts, definitions, or revision points..."
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Index Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

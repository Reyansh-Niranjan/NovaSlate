import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Send,
  Flame,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* =========================================================================
   TYPES & DATA (Asfer-dev/study-ai)
   ========================================================================= */

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  role: "Student" | "Tutor" | "Scholar";
  timestamp: string;
  topic: string;
  content: string;
  upvotes: number;
  upvoted: boolean;
  repliesCount: number;
}

export interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  score?: string;
  feedback?: string;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post_1",
    author: "Kabir Mehta",
    avatar: "KM",
    role: "Student",
    timestamp: "1 hour ago",
    topic: "Class 10 Physics",
    content:
      "Quick memory trick for spherical mirrors: Concave mirrors only form a virtual image when the object is placed between the Pole (P) and Focus (F). In every other position, the image is real & inverted!",
    upvotes: 42,
    upvoted: false,
    repliesCount: 6,
  },
  {
    id: "post_2",
    author: "Dr. Arvind Rao",
    avatar: "AR",
    role: "Tutor",
    timestamp: "3 hours ago",
    topic: "Mathematics Proof Strategy",
    content:
      "When proving irrationality of √2 or √5 for board exams, always explicitly state: 'Let p and q be co-prime integers where q ≠ 0'. Forgetting to state 'co-prime' loses half a mark under standard marking schemes.",
    upvotes: 89,
    upvoted: true,
    repliesCount: 14,
  },
  {
    id: "post_3",
    author: "Diya Patel",
    avatar: "DP",
    role: "Scholar",
    timestamp: "5 hours ago",
    topic: "Life Processes",
    content:
      "Remember that glycolysis produces a net gain of 2 ATP molecules and takes place in the cytoplasm without requiring any oxygen!",
    upvotes: 31,
    upvoted: false,
    repliesCount: 4,
  },
];

const INITIAL_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: "asg_1",
    title: "Light Ray Diagrams & Magnification Calculation",
    subject: "Physics",
    dueDate: "Tomorrow, 5:00 PM",
    status: "submitted",
    score: "19/20",
    feedback: "Crisp arrow markings and correct sign convention usage.",
  },
  {
    id: "asg_2",
    title: "Balancing Chemical Equations Problem Set",
    subject: "Chemistry",
    dueDate: "Oct 2, 2026",
    status: "pending",
  },
  {
    id: "asg_3",
    title: "Trigonometric Proofs - Section 8.4 Review",
    subject: "Mathematics",
    dueDate: "Oct 5, 2026",
    status: "pending",
  },
];

type StudyAITab = "feed" | "assignments" | "network";

export const CommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudyAITab>("feed");

  // Study-AI Feed State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTopic, setNewPostTopic] = useState("Science");

  // Assignments State
  const [assignments, setAssignments] = useState<StudentAssignment[]>(INITIAL_ASSIGNMENTS);

  // Upvote Post
  const handleToggleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              upvoted: !p.upvoted,
              upvotes: p.upvoted ? p.upvotes - 1 : p.upvotes + 1,
            }
          : p
      )
    );
  };

  // Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      author: "Reyansh Niranjan",
      avatar: "RN",
      role: "Scholar",
      timestamp: "Just now",
      topic: newPostTopic,
      content: newPostContent.trim(),
      upvotes: 1,
      upvoted: true,
      repliesCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  // Submit Assignment
  const handleSubmitAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "submitted" } : a))
    );
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[11px] font-mono uppercase tracking-wider text-muted-foreground border border-border/70">
            <Users className="h-3.5 w-3.5 text-purple-500" />
            <span>Study AI Collaborative Platform (Asfer-dev)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-normal tracking-[-0.02em] text-foreground">
            Peer Community &amp; Collaborative Learning
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-body leading-relaxed">
            Dynamic academic feed, peer study questions, assignment workflow, and study buddy hours scoreboard.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-secondary/80 rounded-2xl border border-border/70 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "feed"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Study Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assignments")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "assignments"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Assignments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("network")}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "network"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Study Buddies
          </button>
        </div>
      </div>

      {/* =====================================================================
          1. STUDY-AI COLLABORATIVE COMMUNITY FEED
          ===================================================================== */}
      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Post Creation Box */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Post to Community Discussion
                </span>
                <select
                  value={newPostTopic}
                  onChange={(e) => setNewPostTopic(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share a study tip, ask a clarification, or breakdown a formula..."
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
              />

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publish Note</span>
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-mono text-xs font-semibold text-foreground">
                        {post.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-medium text-foreground">
                            {post.author}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {post.role}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{post.timestamp}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-foreground">
                      #{post.topic}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed font-body">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleToggleUpvote(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.upvoted ? "text-emerald-500 font-semibold" : "hover:text-foreground"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{post.repliesCount} Responses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar: Active Study Network */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
              <div className="border-b border-border/80 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>Peer Study Network</span>
                </span>
                <h3 className="text-sm font-heading font-medium text-foreground mt-0.5">
                  Weekly Study Leaderboard
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Reyansh Niranjan", hours: 28.5, rank: 1, streak: "14 days" },
                  { name: "Aanya Sharma", hours: 26.0, rank: 2, streak: "10 days" },
                  { name: "Kabir Mehta", hours: 22.4, rank: 3, streak: "8 days" },
                  { name: "Diya Patel", hours: 19.8, rank: 4, streak: "5 days" },
                ].map((buddy) => (
                  <div
                    key={buddy.name}
                    className="p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center font-mono text-[11px] font-bold text-foreground">
                        {buddy.rank}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{buddy.name}</p>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {buddy.streak} streak
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-500 font-semibold">{buddy.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. STUDY-AI ASSIGNMENT SUBMISSION WORKFLOW
          ===================================================================== */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5">
            <h2 className="text-base font-heading font-medium text-foreground">
              Class Assignments &amp; Grading
            </h2>
            <p className="text-xs text-muted-foreground">
              Submit practice sheets, review instructor evaluations, and track deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="rounded-3xl border border-border/80 bg-card p-6 flex flex-col justify-between shadow-xs space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {asg.subject}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{asg.dueDate}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-heading font-medium text-foreground">{asg.title}</h3>

                  {asg.feedback && (
                    <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground">
                      <span className="font-mono font-medium text-foreground mr-1">Feedback:</span>
                      {asg.feedback}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <div>
                    {asg.score ? (
                      <span className="font-mono text-emerald-500 font-semibold">Grade: {asg.score}</span>
                    ) : (
                      <span className="font-mono text-muted-foreground capitalize">{asg.status}</span>
                    )}
                  </div>

                  {asg.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => handleSubmitAssignment(asg.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                      Turn In
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Submitted</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          3. STUDY BUDDIES NETWORK
          ===================================================================== */}
      {activeTab === "network" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Aanya Sharma",
              grade: "Class 10",
              focus: "Optics & Biology",
              hours: "26h / wk",
              status: "Online Now",
            },
            {
              name: "Kabir Mehta",
              grade: "Class 10",
              focus: "Standard Mathematics",
              hours: "22.4h / wk",
              status: "In Library",
            },
            {
              name: "Diya Patel",
              grade: "Class 10",
              focus: "Chemistry Reactions",
              hours: "19.8h / wk",
              status: "Online Now",
            },
            {
              name: "Arjun Verma",
              grade: "Class 11",
              focus: "Physics Mechanics",
              hours: "18.2h / wk",
              status: "Away",
            },
          ].map((buddy) => (
            <div
              key={buddy.name}
              className="rounded-3xl border border-border/80 bg-card p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {buddy.grade}
                </span>
                <span className="text-[10px] font-mono text-emerald-500">{buddy.status}</span>
              </div>
              <div>
                <h3 className="text-sm font-heading font-medium text-foreground">{buddy.name}</h3>
                <p className="text-xs text-muted-foreground font-body">{buddy.focus}</p>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Paced:</span>
                <span className="font-semibold text-foreground">{buddy.hours}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

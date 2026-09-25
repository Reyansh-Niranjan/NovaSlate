import { memo } from "react";

interface SubjectItem {
  id: string;
  name: string;
  color: string;
  badge?: string;
  icon: React.ReactNode;
}

export const SubjectShelf = memo(function SubjectShelf({
  onSelectSubject,
}: {
  onSelectSubject?: (id: string) => void;
}) {
  const subjects: SubjectItem[] = [
    {
      id: "math",
      name: "Math",
      color: "#1883B1",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Isometric Math Cube */}
          <path
            d="M12 2.5L20.5 7.5V16.5L12 21.5L3.5 16.5V7.5L12 2.5Z"
            stroke="#1883B1"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 2.5V21.5M3.5 7.5L12 12L20.5 7.5"
            stroke="#1883B1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#1883B1" fillOpacity="0.35" />
        </svg>
      ),
    },
    {
      id: "data",
      name: "Data Analysis",
      color: "#EA580C",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Analytics Folder & Rising Bars */}
          <path
            d="M3 6.5C3 5.4 3.9 4.5 5 4.5H9.5L11.5 6.5H19C20.1 6.5 21 7.4 21 8.5V17.5C21 18.6 20.1 19.5 19 19.5H5C3.9 19.5 3 18.6 3 17.5V6.5Z"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M7 16V13M11 16V10M15 16V12M19 16V8" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "cs",
      name: "Computer Science",
      color: "#7C3AED",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layered Algorithm Diamond Stack */}
          <path
            d="M12 3L2 8L12 13L22 8L12 3Z"
            stroke="#7C3AED"
            strokeWidth="1.75"
            strokeLinejoin="round"
            fill="#7C3AED"
            fillOpacity="0.2"
          />
          <path d="M2 12L12 17L22 12" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 16L12 21L22 16" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "ai",
      name: "Programming & AI",
      color: "#9333EA",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neural Synaptic Nodes & Tuning Branches */}
          <circle cx="6" cy="6" r="2.5" fill="#9333EA" />
          <circle cx="18" cy="6" r="2.5" fill="#9333EA" />
          <circle cx="12" cy="18" r="3" fill="#9333EA" />
          <path
            d="M7.5 7.5L10.5 15.5M16.5 7.5L13.5 15.5"
            stroke="#9333EA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="1.25" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      id: "science",
      name: "Science & Engineering",
      color: "#D97706",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Atomic Honeycomb Orbit */}
          <path
            d="M12 2.5L19.5 6.8V15.5L12 19.8L4.5 15.5V6.8L12 2.5Z"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <ellipse cx="12" cy="11.2" rx="7" ry="3" transform="rotate(-30 12 11.2)" stroke="#D97706" strokeWidth="1.25" strokeDasharray="3 2" />
          <circle cx="12" cy="11.2" r="3" fill="#D97706" />
          <circle cx="12" cy="11.2" r="1.2" fill="#FFFFFF" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full border-t border-border/60 bg-background/60 backdrop-blur-xs py-4 sm:py-5">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 lg:gap-14 overflow-x-auto no-scrollbar py-1">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectSubject?.(sub.id)}
              className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-secondary/60 transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97] interactive-tap"
              title={`Browse ${sub.name} curriculum`}
            >
              <div className="p-1 rounded-lg transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
                {sub.icon}
              </div>
              <span className="font-heading font-semibold text-xs sm:text-sm text-foreground/80 group-hover:text-foreground transition-colors tracking-tight">
                {sub.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

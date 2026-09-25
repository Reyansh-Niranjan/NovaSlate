export interface UspItem {
  key: 'continuity' | 'capacity' | 'collaboration' | 'experience';
  title: string;
  text: string;
}

export interface DeliveryProject {
  description: string;
  localisation: string;
  duration: string;
  link: string;
}

export interface FaqQuestion {
  question: string;
  answer: string;
}

export const siteContent = {
  header: {
    logoLabel: 'NovaSlate',
    links: [
      { label: 'Pipeline', href: '#architecture' },
      { label: 'Digital Library', href: '#curriculum' },
      { label: 'Atlas Hardware', href: '#pricing' },
    ],
    cta: 'Get in Touch',
  },
  hero: {
    awards: [
      'CLASS 1–12 NCERT & CBSE',
      'INTERNET ARCHIVE IAS3 CDN',
      'AUTOMATED SCRAPING PIPELINE',
      'ATLAS ESP32 OFFLINE HARDWARE',
    ],
    title: 'Curating future-ready learning for every student',
    text: 'Automated curriculum curation platform for Indian K-12 education (Class 1–12). Scrapes, grades, organizes, and delivers educational resources — from instant in-browser reading to the offline Atlas ESP32 hardware reader.',
    clients: {
      label: 'Powered by open infrastructure, zero-egress delivery & custom offline hardware',
      logos: [
        { name: 'NCERT & CBSE', logo: '/images/logos/ncert-cbse.svg' },
        { name: 'Internet Archive IAS3', logo: '/images/logos/ias3.svg' },
        { name: 'Python PyMuPDF Engine', logo: '/images/logos/pymupdf.svg' },
        { name: 'Atlas ESP32 Offline Hardware', logo: '/images/logos/atlas-esp32.svg' },
      ],
    },
  },
  usps: {
    title: 'From raw web scraping to an offline hardware reader.',
    text: 'Four technological pillars powering NovaSlate: automated content ingestion, readability grading, board exam study tools, and zero-connectivity hardware delivery.',
    items: [
      {
        key: 'continuity' as const,
        title: 'Automated Scraping & Compression Pipeline',
        text: 'Python crawling engine with PyMuPDF, Pillow, and pdfsizeopt that cleans raw educational resources, removes watermarks, and produces ultra-optimized, high-density PDF archives.',
      },
      {
        key: 'capacity' as const,
        title: 'Readability Grading & Curriculum Curation',
        text: 'Algorithmic grading and standard alignment that organizes textbooks into an intuitive Class 1 to 12 grade, subject, and chapter hierarchy so students find materials in seconds.',
      },
      {
        key: 'collaboration' as const,
        title: 'Dedicated Study Hub & Board Exam PYQs',
        text: 'Comprehensive study companion featuring Class 10 & 12 Previous Year Questions (PYQs), interactive MCQ quizzes, chapter mindmaps, revision notes, and formula cheatsheets.',
      },
      {
        key: 'experience' as const,
        title: 'Atlas ESP32: Zero-Connectivity Hardware',
        text: 'Companion portable hardware reader engineered with ESP32 and MicroSD FAT32 storage, serving the entire digital library over local Wi-Fi to students in low-connectivity areas.',
      },
    ],
  },
  work: {
    execution: {
      title: 'Class 1–12 Curriculum & Study Hub',
    },
    quote: {
      text: 'A student in a rural area should be able to open and study their textbook in seconds, even with zero internet. NovaSlate covers the entire chain from raw web scraping to an offline hardware reader.',
      author: 'Reyansh Niranjan, Creator & Lead Engineer @ NovaSlate',
    },
    showreel: {
      label: 'Platform Tour',
      loopSrc: '/videos/showreel-loop.mp4',
      src: '/videos/showreel.mp4',
      poster: '/videos/showreel-loop-poster.webp',
    },
    delivery: {
      title: 'Active Pipeline & System Modules',
      text: 'The full end-to-end technical architecture deployed across web and offline hardware.',
      cta: 'Explore Digital Library',
      projects: [
        {
          description: 'Class 1–12 Digital Library & In-Browser PDF Viewer',
          localisation: 'IAS3 Zero-Egress CDN',
          duration: 'Live Platform',
          link: '#',
        },
        {
          description: 'Board Exam PYQs, Chapter Mindmaps & Formula Cheatsheets',
          localisation: 'Study Hub Engine',
          duration: 'Class 9–12 Active',
          link: '#',
        },
        {
          description: 'Automated Scraping, Watermark Removal & PDF Compression',
          localisation: 'Python 3.11 / PyMuPDF',
          duration: 'Automated Pipeline',
          link: '#',
        },
        {
          description: 'Atlas ESP32 Companion Device (MicroSD FAT32 Offline Reader)',
          localisation: 'Offline Hardware',
          duration: 'C++ Firmware',
          link: '#',
        },
      ] as DeliveryProject[],
    },
  },
  catchphrase: {
    title: 'Curating future-ready learning for every student.',
  },
  pricing: {
    title: 'Open access for students & educators',
    texts: [
      'NovaSlate is built student-first and open-access. Every Class 1–12 textbook, chapter mindmap, and board exam question paper is 100% free online.',
      'For rural schools, tutoring centers, and students without reliable broadband, our companion Atlas ESP32 hardware kit delivers the complete library completely offline.',
    ],
    toggle: {
      single: 'Resource Estimator',
      recurring: 'Access & Hardware',
    },
    recurring: {
      title: 'Transparent Access Tiers',
      text: 'Freely accessible web platform backed by low-cost offline hardware kits for communities with limited internet connectivity.',
      services: [
        {
          key: 'standard',
          name: 'Web Digital Library',
          price: '0',
          period: 'Free Forever',
          text: 'Complete open access for all Indian K-12 students, teachers, and independent learners.',
          args: [
            'Class 1–12 NCERT, CBSE & State Board textbooks',
            'In-browser high-density PDF viewer with download',
            'Full Study Hub: Board exam PYQs & chapter mindmaps',
            'Interactive MCQ quizzes & revision cheatsheets',
            'Instant search across grade, subject & chapter',
          ],
        },
        {
          key: 'extended',
          name: 'Atlas ESP32 Offline Kit',
          price: '899',
          period: 'One-time Hardware',
          text: 'Dedicated offline reader hardware for rural schools, tutoring centers, and low-connectivity homes.',
          args: [
            'Pre-assembled ESP32 hardware device (C++ firmware)',
            'Pre-flashed 32GB MicroSD FAT32 high-speed card',
            'Local Wi-Fi hotspot mode (no mobile data or internet needed)',
            'Multi-device classroom streaming over local LAN',
            'Open-source hardware schematics & firmware updates',
          ],
        },
      ],
    },
  },
  faq: {
    title: 'Frequently asked questions',
    text: 'Have questions about curriculum coverage, the scraping engine, or Atlas hardware?<br>Feel free to <a href="#triggerSiteContact">get in touch with the creator.</a>',
    questions: [
      {
        question: 'What is NovaSlate and who created it?',
        answer: 'NovaSlate is an automated curriculum curation platform engineered by <strong>Reyansh Niranjan</strong>. It solves the fragmented learning landscape by automatically scraping, grading, and organizing educational resources for Indian K-12 students (Class 1–12) into a unified digital library and companion offline hardware reader.',
      },
      {
        question: 'How does the automated scraping and PDF compression pipeline work?',
        answer: 'NovaSlate features an automated Python 3.11 ingestion pipeline using PyMuPDF, Pillow, and pdfsizeopt. It crawls educational portals, strips distracting watermarks, normalizes layouts, and applies multi-engine compression so high-density textbook PDFs load instantly even on 2G/3G mobile connections.',
      },
      {
        question: 'What is the Atlas ESP32 companion device and how does it work offline?',
        answer: 'Atlas is a custom-engineered portable hardware reader powered by an ESP32 microcontroller and FAT32 MicroSD card. It creates a local zero-data Wi-Fi hotspot, allowing students in rural and low-connectivity regions to connect phone, tablet, or laptop browsers and study entire Class 1–12 textbook libraries without needing an active internet connection or mobile data recharge.',
      },
      {
        question: 'What study tools are included in the NovaSlate Study Hub?',
        answer: 'The Study Hub includes Board Exam Previous Year Questions (PYQs), chapter mindmaps, concise revision notes, formula cheatsheets, and interactive MCQ quizzes specifically aligned to CBSE and state board syllabi for classes 9 through 12.',
      },
      {
        question: 'Which educational boards and classes are currently supported?',
        answer: 'NovaSlate supports Class 1 through Class 12 across NCERT, CBSE, and major Indian state board frameworks, spanning foundational literacy and numeracy (Class 1–5), middle school sciences and social studies (Class 6–8), secondary board subjects (Class 9–10), and senior secondary STEM and commerce streams (Class 11–12).',
      },
      {
        question: 'Where are the textbooks and educational archives hosted?',
        answer: 'All high-density PDF archives are hosted on the Internet Archive (IAS3) Zero-Egress CDN. This ensures permanent, non-commercial availability and blazing-fast download speeds without incurring bandwidth charges that could threaten free access.',
      },
      {
        question: 'Can teachers and tutoring centers download materials for classroom use?',
        answer: 'Yes. Teachers, coaching institutes, and parents can browse cross-grade content, preview PDFs directly in the browser, and download high-resolution copies for printing and offline classroom distribution.',
      },
      {
        question: 'Is NovaSlate free for students?',
        answer: 'Yes. The entire NovaSlate web platform, in-browser PDF reader, and Study Hub resources are 100% free and open-access. The optional Atlas ESP32 hardware device is provided at cost for schools and students in zero-internet areas, with open-source firmware and schematics available on GitHub.',
      },
    ] as FaqQuestion[],
  },
  finalCTA: {
    title: 'Curating future-ready learning<br>for every student',
    button: 'Connect & Request Access',
  },
  strings: {
    projectLink: 'Open textbook',
    startConversation: 'Get in Touch',
    month: 'Free',
    closeModal: 'Close',
    skipToContent: 'Skip to main content',
    contactDialog: 'Connect with NovaSlate',
    showreelDialog: 'Platform walkthrough video',
    closeShowreel: 'Close walkthrough',
  },
};

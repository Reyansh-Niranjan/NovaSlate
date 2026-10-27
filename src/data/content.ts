export interface UspItem {
  key: 'continuity' | 'capacity' | 'collaboration' | 'experience' | 'environment';
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
      { label: 'Atlas Hardware', href: '#features' },
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
    title: 'Learning. Finally, in one place',
    text: 'NovaSlate brings scattered educational resources into one organized learning system, from the web to offline hardware.',
    clients: {
      label: 'Powered by open infrastructure, zero-egress delivery & custom offline hardware',
      logos: [
        { name: 'NCERT & CBSE', logo: '/images/logos/ncert-cbse.svg' },
        { name: 'Internet Archive IAS3', logo: '/images/logos/ias3.svg' },
        { name: 'Python Ingestion Engine', logo: '/images/logos/pymupdf.svg' },
        { name: 'Atlas ESP32 Offline Hardware', logo: '/images/logos/atlas-esp32.svg' },
      ],
    },
  },
  usps: {
    title: 'Five core values. One learning-first mission.',
    text: 'Every decision behind NovaSlate is guided by five core values, from how learning resources are delivered to how the entire experience is designed.',
    items: [
      {
        key: 'continuity' as const,
        title: 'Learning, Not Selling',
        text: 'Education comes first, without distracting ads or unnecessary promotions.',
      },
      {
        key: 'capacity' as const,
        title: 'Everything, Sorted',
        text: 'Educational resources are organized in one accessible, structured system.',
      },
      {
        key: 'collaboration' as const,
        title: 'Worth Your Time',
        text: 'Every feature should make learning more efficient and useful.',
      },
      {
        key: 'experience' as const,
        title: 'Built to Last',
        text: 'Reliable software and hardware designed for long-term use.',
      },
      {
        key: 'environment' as const,
        title: 'Works Where You Are',
        text: 'Learning resources remain accessible across online and offline environments.',
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
    title: 'Better access to learning. Fewer barriers to it.',
  },
  pricing: {
    title: 'Open access for students & educators',
    texts: [
      'NovaSlate is built student-first and open-access. Every Class 1–12 textbook, chapter mindmap, and board exam question paper is 100% free online.',
      'For schools and students without reliable broadband, the companion Atlas ESP32 hardware kit delivers the complete library offline.',
    ],
    toggle: {
      single: 'Resource Estimator',
      recurring: 'Access & Hardware',
    },
    recurring: {
      title: 'Open-Access Infrastructure',
      text: 'Freely accessible web platform backed by open-source offline hardware for communities with limited internet connectivity.',
      services: [
        {
          key: 'standard',
          name: 'Web Digital Library',
          price: '0',
          period: 'Free Forever',
          text: 'Open access for K–12 students and educators across India.',
          args: [
            'Class 1–12 NCERT, CBSE and State Board textbooks',
            'In-browser high-density PDF viewer with download',
            'Study Hub with Board exam PYQs and chapter mindmaps',
            'Interactive MCQ quizzes and revision cheatsheets',
            'Instant search across grade, subject and chapter',
          ],
        },
        {
          key: 'extended',
          name: 'Atlas ESP32 Hardware',
          price: '0',
          period: 'Open Source',
          text: 'Self-hosted offline reader for schools and communities without internet access.',
          args: [
            'Complete ESP32 hardware blueprints and C++ firmware',
            'Ready-to-flash 32GB MicroSD FAT32 disk image',
            'Local Wi-Fi hotspot mode with no mobile data required',
            'Multi-device classroom streaming over local network',
            'Free hardware schematics and firmware on GitHub',
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
        answer: 'NovaSlate is an educational platform created by <strong>Reyansh Niranjan</strong>. It organizes scattered curriculum materials into a unified digital library for Class 1–12 students, paired with an offline hardware reader for low-connectivity classrooms.',
      },
      {
        question: 'How does the automated scraping and PDF compression pipeline work?',
        answer: 'NovaSlate uses a Python ingestion pipeline to collect textbooks directly from NCERT portals. The pipeline strips recurring watermarks, cleans up document structure, and compresses file sizes without degrading text sharpness, so PDFs download quickly over slow mobile connections.',
      },
      {
        question: 'What is the Atlas ESP32 companion device and how does it work offline?',
        answer: 'Atlas is a compact reader built on an ESP32 microcontroller and a MicroSD card. It broadcasts a local Wi-Fi hotspot that nearby phones, tablets, or computers can connect to directly in a browser. Students can read the full Class 1–12 library without internet access or cellular data.',
      },
      {
        question: 'What study tools are included in the NovaSlate Study Hub?',
        answer: 'The Study Hub includes Board Exam Previous Year Questions (PYQs), chapter mindmaps, concise revision notes, formula cheatsheets, and interactive MCQ quizzes aligned to CBSE and state board syllabi for classes 9 through 12.',
      },
      {
        question: 'Which educational boards and classes are currently supported?',
        answer: 'NovaSlate supports Class 1 through Class 12 across national curricula (NCERT and CBSE) as well as state board syllabi: primary grades (Class 1–5), middle school (Class 6–8), secondary boards (Class 9–10), and senior secondary streams (Class 11–12).',
      },
      {
        question: 'Where are the textbooks and educational archives hosted?',
        answer: 'All textbook archives are stored on the Internet Archive (IAS3) zero-egress storage. This guarantees permanent, non-commercial hosting with reliable downloads without incurring bandwidth fees that could jeopardize free access.',
      },
      {
        question: 'Can teachers and tutoring centers download materials for classroom use?',
        answer: 'Yes. Educators and parents can preview any textbook in the browser and download print-ready PDF copies for classroom use.',
      },
      {
        question: 'Is NovaSlate free for students?',
        answer: 'Yes. The entire NovaSlate web platform, digital library, and study tools are 100% free and open-access. For classrooms without internet, Atlas ESP32 schematics and MicroSD card images are completely open-source on GitHub.',
      },
    ] as FaqQuestion[],
  },
  finalCTA: {
    eyebrow: '',
    title: 'Learning.<br />Finally, in one place',
    subtitle: '',
    button: 'Verify it yourself',
    links: [],
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

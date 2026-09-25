// 13 Curated K-12 Curriculum & Study Hub Modules for NovaSlate Platform (Class 1–12)
export interface CurriculumModule {
  id: string;
  title: string;
  ageBand: string;
  discipline: string;
  standard: string;
  accentColor: string;
  nodes: string[];
}

export const curriculumModules: CurriculumModule[] = [
  {
    id: 'class12-physics',
    title: 'Class 12 Physics: Electrostatics & Current Electricity',
    ageBand: 'CLASS 12 · SENIOR SECONDARY',
    discipline: 'Physics & Board Exam PYQ',
    standard: 'CBSE 2024–25 · NCERT PART 1',
    accentColor: '#1883B1',
    nodes: ['Coulomb Law', 'Gauss Theorem', 'Kirchhoff Laws', 'PYQ Bank'],
  },
  {
    id: 'class12-maths',
    title: 'Class 12 Mathematics: Integrals & Vector Algebra',
    ageBand: 'CLASS 12 · SENIOR SECONDARY',
    discipline: 'Higher Mathematics',
    standard: 'CBSE / STATE BOARDS',
    accentColor: '#E4B34C',
    nodes: ['Definite Integrals', 'Differential Eq', '3D Geometry', 'Formula Sheet'],
  },
  {
    id: 'class12-chem',
    title: 'Class 12 Chemistry: Electrochemistry & Kinetics',
    ageBand: 'CLASS 12 · SENIOR SECONDARY',
    discipline: 'Chemical Sciences',
    standard: 'NCERT REVISED SYLLABUS',
    accentColor: '#D2475F',
    nodes: ['Nernst Equation', 'Rate Law', 'Coordination Compounds'],
  },
  {
    id: 'class10-science',
    title: 'Class 10 Science: Chemical Reactions & Electricity',
    ageBand: 'CLASS 10 · SECONDARY BOARD',
    discipline: 'Integrated Science',
    standard: 'CBSE BOARD 10-YEAR PYQS',
    accentColor: '#1883B1',
    nodes: ['Redox Reactions', 'Ohm Law', 'Carbon Compounds', 'Chapter Mindmaps'],
  },
  {
    id: 'class10-maths',
    title: 'Class 10 Mathematics: Real Numbers & Trigonometry',
    ageBand: 'CLASS 10 · SECONDARY BOARD',
    discipline: 'Core Mathematics',
    standard: 'NCERT EXEMPLAR + PYQS',
    accentColor: '#88A9B6',
    nodes: ['Euclid Algorithm', 'Trig Identities', 'Surface Areas', 'MCQ Quizzes'],
  },
  {
    id: 'class10-social',
    title: 'Class 10 Social Science: Democratic Politics & Resources',
    ageBand: 'CLASS 10 · SECONDARY BOARD',
    discipline: 'Social Sciences & Civics',
    standard: 'CBSE / NCERT REVISION',
    accentColor: '#D2475F',
    nodes: ['Power Sharing', 'Federalism', 'Sectors of Economy', 'Summary Deck'],
  },
  {
    id: 'class9-science',
    title: 'Class 9 Science: Matter, Atoms & Laws of Motion',
    ageBand: 'CLASS 9 · SECONDARY',
    discipline: 'Physical & Life Science',
    standard: 'NCERT CURRICULUM',
    accentColor: '#1883B1',
    nodes: ['Fundamental Unit of Life', 'Newton Laws', 'Structure of Atom'],
  },
  {
    id: 'class8-maths',
    title: 'Class 8 Mathematics: Rational Numbers & Linear Equations',
    ageBand: 'CLASS 8 · MIDDLE SCHOOL',
    discipline: 'Middle School Math',
    standard: 'NCERT & STATE BOARDS',
    accentColor: '#E4B34C',
    nodes: ['Exponents', 'Mensuration', 'Algebraic Expressions'],
  },
  {
    id: 'class7-science',
    title: 'Class 7 Science: Nutrition, Heat & Reproduction',
    ageBand: 'CLASS 7 · MIDDLE SCHOOL',
    discipline: 'General Science',
    standard: 'NCERT DIGITAL EDITION',
    accentColor: '#88A9B6',
    nodes: ['Photosynthesis', 'Conduction & Radiation', 'Acids & Bases'],
  },
  {
    id: 'class6-social',
    title: 'Class 6 Social Science: Our Pasts & Earth in Universe',
    ageBand: 'CLASS 6 · MIDDLE SCHOOL',
    discipline: 'History & Geography',
    standard: 'NCERT FOUNDATIONAL',
    accentColor: '#1883B1',
    nodes: ['Early Cities', 'Solar System', 'Panchayati Raj'],
  },
  {
    id: 'class4-evs',
    title: 'Class 4–5 EVS: Looking Around Environmental Studies',
    ageBand: 'CLASS 4–5 · PRIMARY',
    discipline: 'Environmental Inquiry',
    standard: 'NCERT FOUNDATIONAL',
    accentColor: '#E4B34C',
    nodes: ['Water Life', 'Community Work', 'Biodiversity & Plants'],
  },
  {
    id: 'class1-literacy',
    title: 'Class 1–2 Foundational Literacy & Numeracy',
    ageBand: 'CLASS 1–2 · EARLY YEARS',
    discipline: 'Marigold & Math-Magic',
    standard: 'NIPUN BHARAT / NCERT',
    accentColor: '#D2475F',
    nodes: ['Phonetics', 'Number Sense 1-99', 'Shapes & Space'],
  },
  {
    id: 'atlas-hardware',
    title: 'Atlas ESP32: Complete Class 10 Board Offline Pack',
    ageBand: 'HARDWARE · ZERO INTERNET',
    discipline: 'Offline Portable Reader',
    standard: '32GB MICROSD FAT32 · ESP32',
    accentColor: '#1883B1',
    nodes: ['Local Wi-Fi AP', 'Zero Data Recharge', 'Multi-Device Streaming'],
  },
];

/**
 * Pre-renders an offscreen Canvas image for a curriculum card
 */
export function renderCurriculumCardImage(mod: CurriculumModule, dpr: number = 2): HTMLCanvasElement {
  const w = 320 * dpr;
  const h = 210 * dpr;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // Top color accent bar
  ctx.fillStyle = mod.accentColor;
  ctx.fillRect(0, 0, w, 8 * dpr);

  // Card Content
  const pad = 20 * dpr;

  // Category & Age Band
  ctx.fillStyle = mod.accentColor;
  ctx.font = `bold ${9 * dpr}px 'Proxima Nova', 'Montserrat', sans-serif`;
  ctx.letterSpacing = '0.08em';
  ctx.fillText(mod.ageBand, pad, pad + 14 * dpr);

  // Discipline tag
  ctx.fillStyle = '#55717D';
  ctx.font = `600 ${10 * dpr}px 'Lato', sans-serif`;
  ctx.fillText(mod.discipline, pad, pad + 30 * dpr);

  // Title
  ctx.fillStyle = '#0E1B22';
  ctx.font = `bold ${13 * dpr}px 'Proxima Nova', 'Montserrat', sans-serif`;
  ctx.letterSpacing = '-0.02em';
  
  // Word wrap title
  const words = mod.title.split(' ');
  let line = '';
  let y = pad + 54 * dpr;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > w - pad * 2 && i > 0) {
      ctx.fillText(line.trim(), pad, y);
      line = words[i] + ' ';
      y += 18 * dpr;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), pad, y);

  // Node chips container
  const chipY = y + 20 * dpr;
  let chipX = pad;
  for (const node of mod.nodes) {
    ctx.font = `500 ${8.5 * dpr}px 'Lato', sans-serif`;
    const textWidth = ctx.measureText(node).width;
    const chipW = textWidth + 14 * dpr;
    const chipH = 18 * dpr;

    if (chipX + chipW > w - pad) break;

    ctx.fillStyle = '#EBF1F3';
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipW, chipH, 4 * dpr);
    ctx.fill();

    ctx.fillStyle = '#1B313C';
    ctx.fillText(node, chipX + 7 * dpr, chipY + 12.5 * dpr);

    chipX += chipW + 6 * dpr;
  }

  // Footer: Standard badge & NovaSlate seal
  const footerY = h - pad;
  ctx.fillStyle = '#88A9B6';
  ctx.font = `700 ${8.5 * dpr}px 'Supply Mono', monospace`;
  ctx.fillText(mod.standard, pad, footerY);

  ctx.fillStyle = mod.accentColor;
  ctx.font = `bold ${8 * dpr}px 'Proxima Nova', 'Montserrat', sans-serif`;
  ctx.fillText('NOVASLATE CURATED', w - pad - 95 * dpr, footerY);

  return canvas;
}

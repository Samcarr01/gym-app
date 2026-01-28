const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const ROOT = path.resolve(__dirname, '..');
const KB_DIR = path.join(ROOT, 'knowledge-base');
const OUTPUT_FILE = path.join(ROOT, 'src', 'lib', 'training-knowledge.ts');

const KEYWORDS = [
  'principle',
  'progression',
  'progressive',
  'overload',
  'volume',
  'intensity',
  'frequency',
  'periodization',
  'hypertrophy',
  'strength',
  'endurance',
  'recovery',
  'nutrition',
  'program',
  'programming',
  'mesocycle',
  'microcycle',
  'exercise',
  'selection',
  'warm-up',
  'cool-down',
  'rest',
  'injury',
  'safety'
];

function normalizeToAscii(input) {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/[^\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/\r\n/g, '\n');
}

function cleanText(input) {
  return normalizeToAscii(input)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function scoreParagraph(text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of KEYWORDS) {
    if (lower.includes(keyword)) score += 1;
  }
  return score;
}

function selectKeyParagraphs(text, maxChars) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 60);

  const scored = paragraphs
    .map((p, idx) => ({ p, idx, score: scoreParagraph(p) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx);

  const chosen = [];
  let total = 0;

  for (const item of scored) {
    if (total + item.p.length + 2 > maxChars) continue;
    chosen.push(item.p);
    total += item.p.length + 2;
  }

  if (chosen.length === 0) {
    const fallback = text.slice(0, Math.min(maxChars, text.length));
    return fallback;
  }

  return chosen.join('\n\n');
}

async function extractPdfText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: dataBuffer });
  const data = await parser.getText();
  await parser.destroy();
  return cleanText(data.text || '');
}

async function main() {
  const files = fs
    .readdirSync(KB_DIR)
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .sort();

  if (files.length === 0) {
    console.error('No PDF files found in knowledge-base/');
    process.exit(1);
  }

  const sections = [];
  for (const file of files) {
    const fullPath = path.join(KB_DIR, file);
    const raw = await extractPdfText(fullPath);
    const selected = selectKeyParagraphs(raw, 12000);
    const title = path.basename(file, path.extname(file));

    sections.push({
      title,
      content: selected
    });
  }

  const parts = sections.map((section) => {
    return `export const ${toConstName(section.title)} = \`\n=== ${section.title.toUpperCase()} ===\n\n${section.content}\n\`;\n`;
  });

  const combinedNames = sections.map((section) => toConstName(section.title));
  const combined = `export const COMBINED_TRAINING_KNOWLEDGE = \`\n${combinedNames
    .map((name) => `\${${name}}`)
    .join('\n\n')}\n\`;\n`;

  const helper = `
function isPlaceholder(text: string): boolean {
  return text.includes('TODO: Paste') || text.includes('Leave this section empty');
}

export function getTrainingKnowledge(): string {
  if (${combinedNames
    .map((name) => `isPlaceholder(${name})`)
    .join(' && ')}) {
    return '';
  }
  return COMBINED_TRAINING_KNOWLEDGE.trim();
}
`;

  const fileContents = `/**
 * Auto-generated training knowledge.
 * Run: node scripts/extract-pdf-knowledge.js
 */
\n${parts.join('\n')}\n${combined}\n${helper}\n`;

  fs.writeFileSync(OUTPUT_FILE, fileContents, 'utf8');
  console.log(`✓ Updated ${path.relative(ROOT, OUTPUT_FILE)}`);
}

function toConstName(title) {
  return title
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

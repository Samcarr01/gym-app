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
import { QuestionnaireData } from '@/lib/types';

function isPlaceholder(text: string): boolean {
  return text.includes('TODO: Paste') || text.includes('Leave this section empty');
}

const GOAL_KEYWORDS: Record<string, string[]> = {
  strength: ['strength', 'intensity', 'low reps', 'rest'],
  muscle_building: ['hypertrophy', 'muscle', 'volume', 'progressive overload'],
  fat_loss: ['fat loss', 'conditioning', 'energy balance', 'density'],
  endurance: ['endurance', 'aerobic', 'work capacity', 'conditioning'],
  general_fitness: ['general fitness', 'balance', 'full body'],
  sport_specific: ['sport', 'performance', 'power', 'speed']
};

function normalizeKeyword(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase();
}

function collectKeywords(questionnaire: QuestionnaireData): string[] {
  const keywords: string[] = [];
  keywords.push(normalizeKeyword(questionnaire.goals.primaryGoal));
  if (questionnaire.goals.secondaryGoal) {
    keywords.push(normalizeKeyword(questionnaire.goals.secondaryGoal));
  }
  keywords.push(questionnaire.goals.timeframe.toLowerCase());
  keywords.push(...questionnaire.goals.specificTargets);
  keywords.push(questionnaire.experience.currentLevel);
  keywords.push(questionnaire.preferences.cardioPreference);
  if (questionnaire.preferences.preferredSplit) {
    keywords.push(normalizeKeyword(questionnaire.preferences.preferredSplit));
  }
  keywords.push(...questionnaire.preferences.favouriteExercises);
  keywords.push(...questionnaire.preferences.dislikedExercises);
  keywords.push(...questionnaire.equipment.availableEquipment);
  keywords.push(...questionnaire.equipment.limitedEquipment);
  keywords.push(...questionnaire.injuries.movementRestrictions);
  keywords.push(...questionnaire.injuries.painAreas);
  keywords.push(...questionnaire.nutrition.dietaryRestrictions);
  keywords.push(...questionnaire.nutrition.supplementUse);
  keywords.push(questionnaire.nutrition.nutritionApproach);
  keywords.push(questionnaire.nutrition.proteinIntake);
  keywords.push(questionnaire.recovery.sleepQuality);
  keywords.push(questionnaire.recovery.stressLevel.replace('_', ' '));
  keywords.push(questionnaire.recovery.recoveryCapacity);

  const goalWords = GOAL_KEYWORDS[questionnaire.goals.primaryGoal] || [];
  keywords.push(...goalWords);

  return Array.from(new Set(keywords.map((value) => value.toLowerCase()).filter(Boolean)));
}

function scoreParagraph(paragraph: string, keywords: string[]): number {
  const lower = paragraph.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (keyword.length < 3) continue;
    if (lower.includes(keyword)) score += 1;
  }
  return score;
}

function selectRelevantParagraphs(text: string, keywords: string[], maxChars: number): string {
  const paragraphs = text
    .split(/\\n\\s*\\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 80);

  const ranked = paragraphs
    .map((p) => ({ p, score: scoreParagraph(p, keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const chosen: string[] = [];
  let total = 0;
  for (const item of ranked) {
    if (total + item.p.length + 2 > maxChars) continue;
    chosen.push(item.p);
    total += item.p.length + 2;
    if (total >= maxChars) break;
  }

  if (chosen.length === 0) {
    return text.slice(0, Math.min(text.length, maxChars));
  }

  return chosen.join('\\n\\n');
}

export function getTrainingKnowledge(questionnaire?: QuestionnaireData): string {
  const allPlaceholders = ${combinedNames
    .map((name) => `isPlaceholder(${name})`)
    .join(' && ')};
  if (allPlaceholders) {
    return '';
  }

  if (!questionnaire) {
    return COMBINED_TRAINING_KNOWLEDGE.trim();
  }

  const keywords = collectKeywords(questionnaire);
  const selected = selectRelevantParagraphs(COMBINED_TRAINING_KNOWLEDGE, keywords, 6500);
  return selected.trim();
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

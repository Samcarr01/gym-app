# Knowledge Base Integration Guide

## 📁 Add Your PDF Files Here

Place your training methodology PDFs in this folder:

```
knowledge-base/
├── The Complete Fitness Operating System Research Methods Compendium.pdf
├── [Your second PDF file]
└── README.md (this file)
```

## 🔄 How to Integrate PDFs into the AI

### Option 1: Manual Text Extraction (Recommended for now)

1. **Open your PDF** and copy the relevant text sections
2. **Paste into `src/lib/prompts.ts`** in the `SYSTEM_INSTRUCTIONS` section

Example:
```typescript
const SYSTEM_INSTRUCTIONS = `You are an expert strength and conditioning coach...

=== TRAINING METHODOLOGY ===
[Paste relevant sections from your PDF here]

Key principles from the research:
- Progressive overload strategies
- Periodization models
- Recovery protocols
...

Your tone is calm, professional...`;
```

### Option 2: Create a Separate Knowledge File

Create `src/lib/training-knowledge.ts`:

```typescript
export const FITNESS_OS_KNOWLEDGE = `
=== COMPLETE FITNESS OPERATING SYSTEM ===

[Paste full text from PDF 1 here]

Key Training Principles:
1. Principle 1...
2. Principle 2...
...
`;

export const RESEARCH_COMPENDIUM = `
=== RESEARCH & METHODS COMPENDIUM ===

[Paste full text from PDF 2 here]

Evidence-based approaches:
1. Method 1...
2. Method 2...
...
`;
```

Then import in `src/lib/prompts.ts`:
```typescript
import { FITNESS_OS_KNOWLEDGE, RESEARCH_COMPENDIUM } from './training-knowledge';

const SYSTEM_INSTRUCTIONS = `You are an expert...

${FITNESS_OS_KNOWLEDGE}

${RESEARCH_COMPENDIUM}

Your tone is calm...`;
```

### Option 3: Automated PDF Text Extraction (Advanced)

If you want to automatically extract text from PDFs:

1. **Install PDF parser:**
```bash
npm install pdf-parse
```

2. **Create extraction script** (`scripts/extract-pdf-knowledge.js`):
```javascript
const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function main() {
  const pdf1 = await extractPDF('./knowledge-base/file1.pdf');
  const pdf2 = await extractPDF('./knowledge-base/file2.pdf');

  const knowledge = `
export const FITNESS_OS_KNOWLEDGE = \`
${pdf1}
\`;

export const RESEARCH_COMPENDIUM = \`
${pdf2}
\`;
`;

  fs.writeFileSync('./src/lib/training-knowledge.ts', knowledge);
  console.log('✓ Knowledge base updated!');
}

main();
```

3. **Run extraction:**
```bash
node scripts/extract-pdf-knowledge.js
```

## 📝 Best Practices

### 1. Keep it Focused
Don't paste the entire PDF - extract the most relevant sections:
- Training principles
- Exercise guidelines
- Programming rules
- Safety protocols
- Progression strategies

### 2. Format for AI Consumption
Structure the content clearly:
```typescript
const KNOWLEDGE = `
SECTION 1: TRAINING PRINCIPLES
- Principle A: Description
- Principle B: Description

SECTION 2: EXERCISE SELECTION
- Compound movements: List
- Isolation movements: List

SECTION 3: PROGRAMMING GUIDELINES
- Beginner: 3-4 days/week, 3-4 sets per exercise
- Intermediate: 4-5 days/week, 4-5 sets per exercise
...
`;
```

### 3. Test After Adding Knowledge
After adding knowledge:
```bash
npm run dev
# Complete a questionnaire and check if the AI uses the new knowledge
```

## 🎯 What to Extract from Your PDFs

### From "Fitness Operating System":
- Core training philosophies
- System methodologies
- Program design frameworks
- Periodization models

### From "Research & Methods Compendium":
- Evidence-based principles
- Research-backed techniques
- Training methods comparison
- Scientific protocols

## 📏 Size Considerations

**Token Limits:**
- Current system instruction size: ~1,500 tokens
- Maximum recommended: ~8,000 tokens
- GPT-4o context limit: 128,000 tokens

**Tip:** If your PDFs are very large (>10,000 tokens), consider:
1. Summarizing key points
2. Using only the most relevant sections
3. Upgrading to GPT-4 Turbo with larger context

## 🔧 Quick Integration Steps

1. **Copy text from your PDFs**
   - Select relevant sections
   - Copy to clipboard

2. **Open `src/lib/prompts.ts`**
   ```bash
   code src/lib/prompts.ts
   ```

3. **Add after line 57** (after OUTPUT FORMAT section):
   ```typescript
   === TRAINING KNOWLEDGE BASE ===

   [Paste your PDF content here]

   ===========================
   `;
   ```

4. **Restart dev server**
   ```bash
   npm run dev
   ```

5. **Test with a questionnaire**

## 📞 Need Help?

If you need help integrating specific sections, share the key points from your PDFs and I can help format them for the AI.

/**
 * Training Knowledge Base
 *
 * Add content from your PDF files here to enhance the AI's training knowledge.
 * The AI will use this information when generating workout plans.
 */

// === PDF 1: The Complete Fitness Operating System ===
export const FITNESS_OS_KNOWLEDGE = `
=== COMPLETE FITNESS OPERATING SYSTEM ===

TODO: Paste relevant sections from your first PDF here

Example structure:
- Core training principles
- Programming frameworks
- Periodization models
- Exercise selection criteria
- Progression strategies

Leave this section empty for now, or add content when ready.
`;

// === PDF 2: Research & Methods Compendium ===
export const RESEARCH_COMPENDIUM = `
=== RESEARCH & METHODS COMPENDIUM ===

TODO: Paste relevant sections from your second PDF here

Example structure:
- Evidence-based training methods
- Research findings
- Scientific protocols
- Training method comparisons
- Recovery science

Leave this section empty for now, or add content when ready.
`;

// === Combined Knowledge ===
// This combines all knowledge sources into one string that can be added to prompts
export const COMBINED_TRAINING_KNOWLEDGE = `
${FITNESS_OS_KNOWLEDGE}

${RESEARCH_COMPENDIUM}
`;

function isPlaceholder(text: string): boolean {
  return text.includes('TODO: Paste') || text.includes('Leave this section empty');
}

export function getTrainingKnowledge(): string {
  if (isPlaceholder(FITNESS_OS_KNOWLEDGE) && isPlaceholder(RESEARCH_COMPENDIUM)) {
    return '';
  }
  return COMBINED_TRAINING_KNOWLEDGE.trim();
}

// === Quick Reference: How to Use ===
//
// Option 1: Add to system instructions (recommended)
// In src/lib/prompts.ts, add after the main instructions:
//
//   import { COMBINED_TRAINING_KNOWLEDGE } from './training-knowledge';
//
//   const SYSTEM_INSTRUCTIONS = `[existing instructions...]
//
//   ${COMBINED_TRAINING_KNOWLEDGE}
//
//   [rest of instructions...]`;
//
// Option 2: Add to user prompt
// In the buildPrompt function, append to the user message
//
// Option 3: Use selectively based on user goals
// Only include relevant knowledge based on questionnaire data

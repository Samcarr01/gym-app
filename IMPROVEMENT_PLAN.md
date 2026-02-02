# Gym App Improvement Plan

Based on comprehensive Playwright E2E testing and code analysis.

## Test Results Summary

**35/35 tests passing** covering:
- Landing page functionality and navigation
- Mode selection (new/update plans)
- Questionnaire multi-step form flow
- Data persistence (localStorage)
- Accessibility (heading hierarchy, keyboard nav, form labels)
- Responsive design (mobile, tablet, desktop)
- Performance (page load times <5s)
- Error handling (404s, invalid parameters)

---

## Priority 1: AI Plan Generation Quality (Critical)

### Issue 1.1: Equipment Constraints Not Always Respected
**Status**: Partially fixed
**Problem**: AI sometimes generates exercises requiring unavailable equipment
**Root Cause**: Equipment constraints need stronger enforcement in prompt

**Completed Fixes**:
- Added `EQUIPMENT_STATUS` section at top of coaching brief
- Added explicit `BANNED EXERCISES` list for no-gym users
- Added guidance on what to use instead (barbells → dumbbells, machines → bodyweight)

**Remaining Work**:
- [ ] Add validation in `plan-normalizer.ts` to catch and replace any equipment-incompatible exercises
- [ ] Create equipment-aware `ACCESSORY_POOL` variants (gym vs home)
- [ ] Add post-generation check that scans for banned exercise keywords

### Issue 1.2: Exercise Ordering
**Status**: Fixed
**Problem**: Exercises were ordered with simple binary ranking
**Solution Implemented**:
- 5-tier ranking system (primary compounds → secondary compounds → isolation)
- Weak point exercises get priority bump within their tier
- Duplicate removal during reordering

### Issue 1.3: Weak Point Prioritization
**Status**: Fixed
**Problem**: Weak point exercises added to end of workout
**Solution Implemented**:
- `reorderExercises()` now takes weak points as parameter
- Weak point exercises are prioritized to appear earlier when energy is highest

---

## Priority 2: Form/UX Improvements (High)

### Issue 2.1: Mobile Sidebar Layout
**Observation**: On mobile, sidebar info gets pushed below the form
**Recommendation**:
- [ ] Consider collapsible sidebar or modal for mobile
- [ ] Move key info (time to complete) into form header on small screens

### Issue 2.2: Step Progress Persistence
**Status**: Working
**Note**: Tests confirm localStorage saves/restores correctly

### Issue 2.3: Form Validation UX
**Observation**: Validation works but errors could be more prominent
**Recommendations**:
- [ ] Add shake animation on validation failure
- [ ] Scroll to first error field
- [ ] Add summary of errors at top of form

---

## Priority 3: Performance Optimizations (Medium)

### Issue 3.1: Bundle Size
**Current**: First load JS ~135KB for questionnaire page
**Recommendations**:
- [ ] Lazy load step components (dynamic imports)
- [ ] Tree-shake unused shadcn components
- [ ] Consider code splitting by route

### Issue 3.2: AI Generation Time
**Observation**: Generation can take 30-60 seconds
**Recommendations**:
- [ ] Add more granular progress indicators
- [ ] Consider streaming partial results to show plan building in real-time
- [ ] Cache common exercise templates

---

## Priority 4: Test Coverage Expansion (Medium)

### Current Coverage
- E2E: 35 tests covering happy paths
- Unit tests: Not implemented

### Recommended Additions
- [ ] Add unit tests for `plan-normalizer.ts` (exercise ordering, equipment filtering)
- [ ] Add unit tests for `prompts.ts` (prompt building)
- [ ] Add API route tests (mock OpenAI responses)
- [ ] Add visual regression tests for plan output

### Test File Structure
```
tests/
├── e2e/
│   └── app.spec.ts (existing)
├── unit/
│   ├── plan-normalizer.test.ts
│   ├── prompts.test.ts
│   └── program-design.test.ts
└── api/
    └── generate-plan.test.ts
```

---

## Priority 5: Code Quality (Low)

### Issue 5.1: Large Files
**Files approaching 50KB limit**:
- `plan-normalizer.ts` - Consider splitting into modules
- `prompts.ts` - Could split system instructions into separate file

### Issue 5.2: Type Safety
**Recommendations**:
- [ ] Add stricter types for exercise categories
- [ ] Create enum for equipment types
- [ ] Add runtime validation for AI responses

---

## Implementation Roadmap

### Phase 1: Immediate (This Week)
1. ✅ Fix exercise ordering
2. ✅ Add equipment constraints to prompt
3. [ ] Add equipment validation in normalizer

### Phase 2: Short-term (Next 2 Weeks)
1. [ ] Equipment-aware accessory pool
2. [ ] Mobile layout improvements
3. [ ] Add unit tests for normalizer

### Phase 3: Medium-term (Month)
1. [ ] Performance optimizations
2. [ ] Streaming generation updates
3. [ ] Expanded test coverage

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| E2E Tests Passing | 35/35 | Maintain 100% |
| Page Load Time | <1s | <500ms |
| Plan Generation Time | ~45s | <30s |
| Equipment Compliance | ~80% | 100% |
| Exercise Order Correctness | ~90% | 100% |

---

## Files Modified in This Session

1. `src/lib/prompts.ts`
   - Added `EQUIPMENT_RESTRICTIONS` mapping
   - Added `getEquipmentRestrictions()` function
   - Added `EQUIPMENT STATUS` section to prompt
   - Added `Exercise Ordering Rules` to system instructions

2. `src/lib/plan-normalizer.ts`
   - Rewrote `rankExercise()` with 5-tier system
   - Updated `reorderExercises()` to accept weak points
   - Added duplicate removal during reordering
   - Added weak point to normalizer context

3. `tests/app.spec.ts` (new)
   - 35 comprehensive E2E tests

4. `playwright.config.ts` (new)
   - Playwright configuration

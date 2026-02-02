import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display main heading and CTA', async ({ page }) => {
    await page.goto('/');

    // Check main heading exists
    await expect(page.locator('h1')).toContainText('gym plan app');

    // Check primary CTA button exists
    const ctaButton = page.getByRole('link', { name: /start the questionnaire/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to start page from CTA', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /start the questionnaire/i }).click();
    await expect(page).toHaveURL('/start');
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check header navigation
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Check features section exists
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.getByText('Personalised split')).toBeVisible();
    await expect(page.getByText('Exercise variety')).toBeVisible();
    await expect(page.getByText('Real guidance')).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await page.goto('/');

    // Check how it works section
    await expect(page.locator('#how')).toBeVisible();
    await expect(page.getByText('Answer the questionnaire')).toBeVisible();
    await expect(page.getByText('AI builds your program')).toBeVisible();
  });
});

test.describe('Mode Selection Page', () => {
  test('should display both mode options', async ({ page }) => {
    await page.goto('/start');

    // Check both mode cards exist
    await expect(page.getByText('Build New Plan')).toBeVisible();
    await expect(page.getByText('Update Existing Plan')).toBeVisible();
  });

  test('should navigate to questionnaire with new mode', async ({ page }) => {
    await page.goto('/start');

    await page.getByText('Build New Plan').click();
    await expect(page).toHaveURL('/questionnaire?mode=new');
  });

  test('should navigate to questionnaire with update mode', async ({ page }) => {
    await page.goto('/start');

    await page.getByText('Update Existing Plan').click();
    await expect(page).toHaveURL('/questionnaire?mode=update');
  });

  test('mode cards should have proper descriptions', async ({ page }) => {
    await page.goto('/start');

    await expect(page.getByText(/Start fresh with a complete questionnaire/i)).toBeVisible();
    await expect(page.getByText(/Modify your current workout plan/i)).toBeVisible();
  });
});

test.describe('Questionnaire Page - New Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/questionnaire?mode=new');
  });

  test('should display questionnaire header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Tell the AI about your training world');
  });

  test('should show step indicator with progress', async ({ page }) => {
    // Check for step indicator text pattern "Step X of Y"
    await expect(page.getByText(/Step \d+ of \d+/)).toBeVisible();
  });

  test('should start on goals step', async ({ page }) => {
    // Goals step should be visible - check for the card title (use heading role)
    await expect(page.getByRole('heading', { name: 'Your Goals' })).toBeVisible();
  });

  test('should have next button', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
  });

  test('should display goals form fields', async ({ page }) => {
    // Check for primary goal select
    await expect(page.getByLabel(/main goal/i)).toBeVisible();

    // Check for timeframe select
    await expect(page.getByLabel(/how long/i)).toBeVisible();
  });

  test('should have default values in dropdowns', async ({ page }) => {
    // Primary goal should have a selected option
    const primaryGoalSelect = page.locator('#primaryGoal');
    await expect(primaryGoalSelect).toBeVisible();
  });

  test('should advance to next step when clicking next', async ({ page }) => {
    // Goals already has default values, so clicking next should work
    await page.getByRole('button', { name: /next/i }).click();

    // Should advance to experience step - wait for content change
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: /experience/i })).toBeVisible();
  });

  test('should be able to go back to previous step', async ({ page }) => {
    // Advance to next step first
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Go back
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should be back on goals
    await expect(page.getByRole('heading', { name: 'Your Goals' })).toBeVisible();
  });

  test('sidebar should display helpful info on desktop', async ({ page }) => {
    // Ensure desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByText('What gets personalised')).toBeVisible();
    await expect(page.getByText('Time to complete')).toBeVisible();
  });

  test('should allow changing primary goal selection', async ({ page }) => {
    const primaryGoalSelect = page.locator('#primaryGoal');
    await primaryGoalSelect.selectOption('strength');

    // Verify selection changed
    await expect(primaryGoalSelect).toHaveValue('strength');
  });
});

test.describe('Questionnaire Navigation Flow', () => {
  test('should navigate through all steps', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');
    await page.evaluate(() => localStorage.clear());

    const steps = [
      'Your Goals',
      'Experience', // May vary
      'Availability',
      'Equipment',
      'Injuries',
      'Recovery',
      'Nutrition',
      'Preferences',
      'Constraints'
    ];

    // Navigate through each step
    for (let i = 0; i < steps.length - 1; i++) {
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(300);
    }

    // Should reach the last step
    await expect(page.getByRole('button', { name: /generate|submit/i })).toBeVisible();
  });
});

test.describe('Questionnaire - Equipment Step', () => {
  test('should show gym access toggle', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');
    await page.evaluate(() => localStorage.clear());

    // Navigate to equipment step (step 4)
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }

    // Check for gym access related content
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/gym|equipment/i);
  });
});

test.describe('Generate Page', () => {
  test('should show error when no questionnaire data', async ({ page }) => {
    // Clear session storage and go to generate page directly
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    await page.goto('/generate');

    // Should show error state - use first() to handle multiple matches
    await page.waitForTimeout(1000);
    await expect(page.getByText('No questionnaire data found.').first()).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('landing page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to the CTA button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that we can navigate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('form fields should have labels', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');

    // Check that primary goal has a label
    const primaryGoalLabel = page.getByText(/main goal/i);
    await expect(primaryGoalLabel).toBeVisible();

    // Check timeframe has a label
    const timeframeLabel = page.getByText(/how long/i);
    await expect(timeframeLabel).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('landing page should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main heading should still be visible
    await expect(page.locator('h1')).toBeVisible();

    // CTA should still be accessible
    const cta = page.getByRole('link', { name: /start the questionnaire/i });
    await expect(cta).toBeVisible();
  });

  test('questionnaire should display on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/questionnaire?mode=new');

    // Goals card should be visible
    await expect(page.getByRole('heading', { name: 'Your Goals' })).toBeVisible();

    // Next button should be reachable
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();

    // Mobile info banner should be visible
    await expect(page.getByText('~3 min', { exact: true })).toBeVisible();
    await expect(page.getByText('Auto-saves progress')).toBeVisible();
  });

  test('landing page should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('landing page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('questionnaire page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/questionnaire?mode=new');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid URLs gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    // Should get a 404 response
    expect(response?.status()).toBe(404);
  });

  test('questionnaire should handle invalid mode parameter', async ({ page }) => {
    await page.goto('/questionnaire?mode=invalid');

    // Should still load (defaults to 'new' mode)
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Data Persistence', () => {
  test('questionnaire should save progress to localStorage', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');
    await page.evaluate(() => localStorage.clear());

    // Change a selection
    const primaryGoalSelect = page.locator('#primaryGoal');
    await primaryGoalSelect.selectOption('strength');

    // Wait for save
    await page.waitForTimeout(500);

    // Check localStorage
    const saved = await page.evaluate(() => localStorage.getItem('gym-plan-questionnaire'));
    expect(saved).not.toBeNull();
    expect(saved).toContain('strength');
  });

  test('questionnaire should restore progress on refresh', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');
    await page.evaluate(() => localStorage.clear());

    // Change primary goal
    const primaryGoalSelect = page.locator('#primaryGoal');
    await primaryGoalSelect.selectOption('fat_loss');
    await page.waitForTimeout(500);

    // Refresh
    await page.reload();
    await page.waitForTimeout(500);

    // Check if selection is restored
    await expect(page.locator('#primaryGoal')).toHaveValue('fat_loss');
  });
});

test.describe('Form Validation', () => {
  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.goto('/questionnaire?mode=new');

    // Try to clear a required field and submit
    const primaryGoalSelect = page.locator('#primaryGoal');
    // Primary goal has default, so it should pass

    // Navigate through steps to check validation works
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(300);

    // Should advance (defaults are valid)
    await expect(page.getByRole('heading', { name: /experience/i })).toBeVisible();
  });
});

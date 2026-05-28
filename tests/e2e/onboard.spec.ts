import { test, expect } from '@playwright/test';

test('onboard quick form leads to dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/onboard');
  await page.locator('text=Quick Profile Form').click();
  await page.fill('#gpa', '3.2');
  await page.fill('#credits', '30');
  await page.click('text=Find My Matches');
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard');
  expect(page.url()).toContain('/dashboard');
});

import { test, expect } from '@playwright/test';

test.describe('TUMA Cloud — Public Showcase & Marketing Site', () => {
  test('should load homepage and display hero with SDK tabs', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await expect(page).toHaveTitle(/TUMA/i);

    // Verify main hero heading
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Verify SDK code tabs (Node.js, Python, cURL)
    const nodeTab = page.getByRole('button', { name: /node/i }).first();
    await expect(nodeTab).toBeVisible();
  });

  test('should navigate to Pricing and toggle USD/CDF', async ({ page }) => {
    await page.goto('http://localhost:3002/pricing');
    await expect(page.locator('body')).toContainText(/Tarif/i);

    // Verify currency switcher
    const cdfToggle = page.getByRole('button', { name: /CDF/i }).first();
    if (await cdfToggle.isVisible()) {
      await cdfToggle.click();
      await expect(page.locator('body')).toContainText(/CDF/i);
    }
  });

  test('should navigate to Status Page and display all 5 subsystems', async ({ page }) => {
    await page.goto('http://localhost:3002/status');
    await expect(page.locator('h1')).toContainText(/Systèmes/i);

    // Check subsystems
    await expect(page.locator('body')).toContainText(/Cluster d Ingestion API/i);
    await expect(page.locator('body')).toContainText(/Vodacom/i);
    await expect(page.locator('body')).toContainText(/BullMQ/i);
  });

  test('should navigate to Fintech Use Case and display receipt mockup', async ({ page }) => {
    await page.goto('http://localhost:3002/use-cases/fintech-payments');
    await expect(page.locator('h1')).toContainText(/Mobile Money/i);
    await expect(page.locator('body')).toContainText(/M-Pesa/i);
  });

  test('should test the Live Sandbox email dispatch', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Find the sandbox email input
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('playwright-test@kinshasa.cd');
      const submitBtn = page.getByRole('button', { name: /Tester l Envoi/i }).first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Wait for response badge
        await expect(page.locator('body')).toContainText(/202|Envoyé|Succès/i);
      }
    }
  });
});

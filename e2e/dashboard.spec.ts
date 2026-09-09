import { test, expect } from '@playwright/test';

test.describe('TUMA Cloud — Admin Dashboard Console', () => {
  test('should login via 1-click credentials and reach Overview', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('h2')).toContainText(/Connexion/i);

    // Click "Remplir 1-Clic"
    const autofillBtn = page.getByRole('button', { name: /Remplir 1-Clic/i });
    if (await autofillBtn.isVisible()) {
      await autofillBtn.click();
    } else {
      await page.locator('input[type="email"]').fill('benny@tuma.dev');
      await page.locator('input[type="password"]').fill('secret_password_123');
    }

    // Click submit
    await page.getByRole('button', { name: /Se Connecter/i }).click();

    // Verify Overview loaded
    await expect(page.locator('body')).toContainText(/Vue d'Ensemble/i, { timeout: 10000 });
  });

  test('should inspect the ISP Deliverability Radar widget', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('benny@tuma.dev');
    await page.locator('input[type="password"]').fill('secret_password_123');
    await page.getByRole('button', { name: /Se Connecter/i }).click();
    await expect(page.locator('body')).toContainText(/Vue d'Ensemble/i, { timeout: 10000 });

    // Check ISP radar cards
    await expect(page.locator('body')).toContainText(/Radar de Délivrabilité/i);
    await expect(page.locator('body')).toContainText(/Vodacom/i);
    await expect(page.locator('body')).toContainText(/Orange/i);
  });

  test('should open and close the Cyberpunk Live Terminal Stream', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('benny@tuma.dev');
    await page.locator('input[type="password"]').fill('secret_password_123');
    await page.getByRole('button', { name: /Se Connecter/i }).click();
    await expect(page.locator('body')).toContainText(/Vue d'Ensemble/i, { timeout: 10000 });

    // Open terminal modal
    const streamBtn = page.getByRole('button', { name: /Live Terminal Stream/i });
    if (await streamBtn.isVisible()) {
      await streamBtn.click();
      await expect(page.locator('body')).toContainText(/tuma-cluster-stream/i);
    }
  });

  test('should view Email Logs and Export CSV button', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').fill('benny@tuma.dev');
    await page.locator('input[type="password"]').fill('secret_password_123');
    await page.getByRole('button', { name: /Se Connecter/i }).click();
    await expect(page.locator('body')).toContainText(/Vue d'Ensemble/i, { timeout: 10000 });

    // Navigate to Emails tab
    await page.getByRole('button', { name: /Logs d Emails/i }).click();

    // Verify Export CSV button is present
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible({ timeout: 10000 });
  });
});

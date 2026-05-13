// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';

// Helper: assert only one screen is visible
async function activeScreen(page) {
  const screens = await page.locator('.screen.active');
  await expect(screens).toHaveCount(1);
  return screens.first();
}

// Helper: click continue
const next = (page) => page.locator('.circle-btn:not(.secondary)').click();
// Helper: click back
const back = (page) => page.locator('.circle-btn.secondary').click();

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/index.html`);
  await expect(page.locator('#s1')).toBeVisible();
});

// ── S1 VALIDATION ──────────────────────────────────────────────────────────
test('S1: requires a selection before continuing', async ({ page }) => {
  await next(page);
  await expect(page.locator('#s1-error')).toBeVisible();
  await expect(page.locator('#s1')).toBeVisible();
});

// ── NEWCOMER FLOW: S1 → S4 → S5 → S9 ──────────────────────────────────────
test('Newcomer flow reaches loader', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Zatím nemám e-shop' }).click();
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();

  await next(page);
  await expect(page.locator('#s5')).toBeVisible();

  // Select Fyzická osoba (no IČO required)
  await page.locator('#s5-fo').click();
  await next(page);
  await expect(page.locator('#s9')).toBeVisible();
});

// ── NEWCOMER BACK NAVIGATION ───────────────────────────────────────────────
test('Newcomer: back from S4 returns to S1', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Zatím nemám e-shop' }).click();
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();
  await back(page);
  await expect(page.locator('#s1')).toBeVisible();
});

// ── MIGRATION FLOW: S1 → S2 → S4 → S5 → S9 ───────────────────────────────
test('Migration flow reaches loader (skips URL screen)', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'převést na Shoptet' }).click();
  await next(page);
  await expect(page.locator('#s2')).toBeVisible();

  // S2 → S4 (no URL screen in migration flow)
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();
  await expect(page.locator('#s3')).not.toBeVisible();

  await next(page);
  await expect(page.locator('#s5')).toBeVisible();

  await page.locator('#s5-fo').click();
  await next(page);
  await expect(page.locator('#s9')).toBeVisible();
});

test('Migration: back from S4 returns to S2', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'převést na Shoptet' }).click();
  await next(page);
  await next(page); // S2 → S4
  await expect(page.locator('#s4')).toBeVisible();
  await back(page);
  await expect(page.locator('#s2')).toBeVisible();
});

// ── PARTNER FLOW: S1 → S8 → S4 → S5 → S9 ─────────────────────────────────
test('Partner flow: S8 requires partner code', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'pro klienta' }).click();
  await next(page);
  await expect(page.locator('#s8')).toBeVisible();

  // Try continuing without code
  await next(page);
  await expect(page.locator('#s8-error')).toBeVisible();
  await expect(page.locator('#s8')).toBeVisible();
});

test('Partner flow reaches loader', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'pro klienta' }).click();
  await next(page);
  await page.locator('#s8-partner-input').fill('PARTNER123');
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();

  await next(page);
  await page.locator('#s5-fo').click();
  await next(page);
  await expect(page.locator('#s9')).toBeVisible();
});

// ── EXISTING CUSTOMER FLOW: S1 → S3 → S4 → S5 → S9 ───────────────────────
test('Existing customer flow: S3 requires URL', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Shoptetu mám' }).click();
  await next(page);
  await expect(page.locator('#s3')).toBeVisible();

  await next(page);
  await expect(page.locator('#s3-error')).toBeVisible();
});

test('Existing customer flow reaches loader', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Shoptetu mám' }).click();
  await next(page);
  await page.locator('#url-input').fill('https://www.mujeshop.cz');
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();

  await next(page);
  await page.locator('#s5-fo').click();
  await next(page);
  await expect(page.locator('#s9')).toBeVisible();
});

// ── S5 VALIDATION ──────────────────────────────────────────────────────────
test('S5: firma requires ICO', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Zatím nemám e-shop' }).click();
  await next(page); // → S4
  await next(page); // → S5

  await page.locator('#s5-firma').click();
  await next(page);
  await expect(page.locator('#s5-ico-error')).toBeVisible();
  await expect(page.locator('#s5')).toBeVisible();
});

test('S5: firma passes with ICO filled', async ({ page }) => {
  await page.locator('#s1 .option-card').filter({ hasText: 'Zatím nemám e-shop' }).click();
  await next(page);
  await next(page);

  await page.locator('#s5-firma').click();
  await page.locator('#s5-firma-ico').fill('12345678');
  await next(page);
  await expect(page.locator('#s9')).toBeVisible();
});

// ── JINÉ FLOW ──────────────────────────────────────────────────────────────
test('Jiné flow: goes directly to S4', async ({ page }) => {
  await page.locator('#s1-jine-card').click();
  await next(page);
  await expect(page.locator('#s4')).toBeVisible();
});

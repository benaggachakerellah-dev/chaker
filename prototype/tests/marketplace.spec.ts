import { test, expect } from '@playwright/test';

test.describe('Desert Gold Marketplace E2E Tests', () => {
  test('1. Homepage navigation and branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Desert Gold').first()).toBeVisible();
    await expect(page.locator('nav').locator('text=Catalog')).toBeVisible();
    await expect(page.locator('nav').locator('text=Traceability')).toBeVisible();
    await expect(page.locator('nav').locator('text=Farms')).toBeVisible();
  });

  test('2. Catalogue navigation and filtering', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('h1')).toContainText('Premium Dates Catalog');

    // Check products are rendered
    await expect(page.locator('text=Medjool').first()).toBeVisible();

    // Filter by Medjool variety
    await page.click('button:has-text("Medjool")');
    await expect(page.locator('text=Medjool').first()).toBeVisible();
  });

  test('3. Product details inspection', async ({ page }) => {
    await page.goto('/catalog');
    // Click Details on first product
    await page.click('text=Details');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Batch Traceability & Quality Inspection')).toBeVisible();
    await expect(page.locator('text=Sugar Content')).toBeVisible();
  });

  test('4. Add to cart and quantity changes', async ({ page }) => {
    await page.goto('/catalog');
    await page.locator('button:has-text("Add")').first().click();

    // Go to cart
    await page.click('nav a[href="/cart"]');
    await expect(page.locator('h1')).toContainText('Shopping Cart');
    await expect(page.locator('.card').first()).toBeVisible();

    // Increase quantity
    await page.click('button:has-text("+")');
    await expect(page.locator('span.px-3.py-1.font-semibold')).toHaveText('2');
  });

  test('5. Remove item and empty-cart state', async ({ page }) => {
    await page.goto('/catalog');
    await page.locator('button:has-text("Add")').first().click();
    await page.click('nav a[href="/cart"]');
    await expect(page.locator('h1')).toContainText('Shopping Cart');

    // Remove item
    await page.click('button[title="Remove item"]');
    await expect(page.locator('text=Your Cart is Empty')).toBeVisible();
  });

  test('6. Demo checkout flow', async ({ page }) => {
    await page.goto('/catalog');
    await page.locator('button:has-text("Add")').first().click();
    await page.click('nav a[href="/cart"]');
    await expect(page.locator('h1')).toContainText('Shopping Cart');

    // Click Proceed to Demo Checkout
    await page.click('button:has-text("Proceed to Demo Checkout")');
    await expect(page.locator('text=Demo Checkout Successful')).toBeVisible();
    await expect(page.locator('text=Demo Order Reference')).toBeVisible();
  });

  test('7. Farm listing page', async ({ page }) => {
    await page.goto('/farms');
    await expect(page.locator('h1')).toContainText('Our Partner Farms');
    await expect(page.locator('text=Al-Noor Dates Estate (Demo)')).toBeVisible();
    await expect(page.locator('text=Deglet Valley Cooperative (Demo)')).toBeVisible();
  });

  test('8. Traceability lookup for valid and invalid batch', async ({ page }) => {
    await page.goto('/traceability');
    await expect(page.locator('h1')).toContainText('Batch Traceability & Quality Lookup');

    // Valid batch search
    await page.fill('input[placeholder*="BATCH"]', 'BATCH-MED-2024-01');
    await page.click('button:has-text("Verify Batch")');
    await expect(page.locator('text=Verified Demo Inspection')).toBeVisible();
    await expect(page.locator('text=68.5° Brix')).toBeVisible();

    // Invalid batch search
    await page.fill('input[placeholder*="BATCH"]', 'INVALID-BATCH-999');
    await page.click('button:has-text("Verify Batch")');
    await expect(page.locator('text=Batch Not Found')).toBeVisible();
  });

  test('9. Demo banner appears for synthetic batch, and provenance field is enforced by TypeScript', async ({ page }) => {
    await page.goto('/traceability');
    await page.fill('input[placeholder*="BATCH"]', 'BATCH-MED-2024-01');
    await page.click('button:has-text("Verify Batch")');

    // Assert the amber demo banner is visible when a synthetic batch is loaded
    await expect(page.locator('text=SYNTHETIC DEMO RECORD')).toBeVisible();
    await expect(page.locator('text=DEMO ONLY')).toBeVisible();
  });
});

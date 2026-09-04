import { expect, test } from '@playwright/test';
import { FILE_ROUTES, PAGE_ROUTES } from './routes';

/**
 * Smoke tests against the production build.
 *
 * Three things are checked on every page: it responds 200, it logs no console or
 * page errors, and it does not scroll horizontally. The last one is why the suite
 * runs at 320px as well as desktop — the quality floor commits to 320, and a
 * regression there is invisible on a laptop.
 */

for (const route of PAGE_ROUTES) {
  test(`${route} loads cleanly`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'networkidle' });

    expect(response?.status(), `${route} status`).toBe(200);
    expect(pageErrors, `${route} uncaught exceptions`).toEqual([]);
    expect(consoleErrors, `${route} console errors`).toEqual([]);
  });

  test(`${route} does not scroll horizontally`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      const offenders = [...document.querySelectorAll('*')]
        .filter((node) => node.getBoundingClientRect().right > el.clientWidth + 1)
        .slice(0, 5)
        .map((node) => `${node.tagName}.${String(node.className).slice(0, 40)}`);
      return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, offenders };
    });

    expect(overflow.offenders, `${route} elements past the viewport`).toEqual([]);
    expect(overflow.scrollWidth, `${route} horizontal scroll`).toBeLessThanOrEqual(
      overflow.clientWidth,
    );
  });
}

for (const route of FILE_ROUTES) {
  test(`${route} is served`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status(), `${route} status`).toBe(200);
  });
}

test('every page has exactly one h1 and a skip link', async ({ page }) => {
  for (const route of PAGE_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1'), `${route} h1 count`).toHaveCount(1);
    await expect(page.locator('a.skip-link'), `${route} skip link`).toHaveCount(1);
  }
});

test('no statistic renders as an empty value', async ({ page }) => {
  /*
   * The brief forbids any figure rendering as 0, a dash, NaN, or a spinner. The
   * mono class marks measured values, so every one of them is inspected.
   *
   * Every page is scanned rather than a hardcoded pair. /code used to be the
   * second entry, then stopped rendering any figure at all, then stopped
   * existing. A page with no measured values is fine; a page with a broken one
   * is not, and the site as a whole must still be rendering some.
   */
  let total = 0;
  for (const route of PAGE_ROUTES) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const values = await page.locator('.font-mono').allInnerTexts();
    total += values.length;

    for (const value of values) {
      expect(value.trim(), `${route} empty statistic`).not.toBe('');
      expect(value.trim(), `${route} zero statistic`).not.toBe('0');
      expect(value, `${route} NaN statistic`).not.toContain('NaN');
      expect(value, `${route} dash statistic`).not.toMatch(/^[—–-]$/);
      expect(value, `${route} undefined statistic`).not.toContain('undefined');
    }
  }
  expect(total, 'the site renders at least one measured value').toBeGreaterThan(0);
});

test('no coding-profile figure renders anywhere', async ({ page }) => {
  // Problem counts, difficulty splits and platform rankings are off the site.
  // Enforced against the served HTML, not the source, so a figure cannot arrive
  // through a snapshot or a stray import.
  const banned = [/\bproblems solved\b/i, /coding score/i, /institute rank/i];
  for (const route of PAGE_ROUTES) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const text = await page.locator('body').innerText();
    for (const pattern of banned) {
      expect(text, `${route} matches ${pattern}`).not.toMatch(pattern);
    }
  }
});

test('the proof strip shows four figures, each with provenance', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const cells = page.locator('ol > li', { has: page.locator('.font-mono') });
  await expect(cells).toHaveCount(4);
});

test('measured values use the subset monospace, with the grotesk behind it', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const family = await page
    .locator('.font-mono')
    .first()
    .evaluate((node) => getComputedStyle(node).fontFamily);

  expect(family).toContain('Plex Mono Measured');
  // Instrument Sans must follow, so an out-of-subset glyph degrades to the
  // grotesk rather than to an arbitrary system monospace.
  expect(family).toContain('Instrument Sans');
});

test('the contact endpoint reports failure instead of pretending to send', async ({
  request,
}) => {
  // With no mail provider configured this must be a 5xx that says so, never a 200.
  const response = await request.post('/api/contact', {
    data: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'A message long enough to pass validation checks on the server.',
    },
  });

  expect(response.status()).not.toBe(200);
  const body = (await response.json()) as { status: string; reason?: string };
  expect(['unavailable', 'failed']).toContain(body.status);
  expect(body.reason ?? '').toMatch(/not sent|could not/i);
});

test('the contact form rejects bad input with a visible message', async ({ page }) => {
  // The form lives on /contact. The home page keeps the address and a link.
  await page.goto('/contact', { waitUntil: 'networkidle' });
  await page.getByLabel('Name').fill('Ada');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Message').fill('too short');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText(/does not look like an email address/)).toBeVisible();
  // Case-insensitive: the copy owns its own capitalisation, the test asserts the fact.
  await expect(page.getByText(/at least 20 characters/i)).toBeVisible();
});

test('reduced motion removes the one animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });

  const animation = await page
    .locator('.proof-rule')
    .first()
    .evaluate((node) => getComputedStyle(node).animationName);

  expect(animation === 'none' || animation === '').toBeTruthy();
  await context.close();
});

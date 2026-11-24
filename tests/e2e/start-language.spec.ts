// The starting language by address (owner, 24 Nov 2026; src/app/startLanguage.ts). The built site is served under other
// addresses by answering their requests from the preview server, so the page itself sees the .com or .co.il address.
import { test, expect, type Page } from './fixtures';

const serveAs = async (page: Page, host: string, baseURL: string) => {
  await page.route(`http://${host}/**`, async (route) => {
    const u = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: `${baseURL}${u.pathname}${u.search}` }) });
  });
};
const storedLang = (page: Page) => page.evaluate(() => (JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}') as { lang?: string }).lang ?? null);

test('a new visitor at a .com address gets English, at .co.il Hebrew; ?lang= wins and leaves the address', async ({ page, baseURL }) => {
  await serveAs(page, 'elections.example.com', baseURL!);
  await serveAs(page, 'elections.example.co.il', baseURL!);

  await page.goto('http://elections.example.com/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page).toHaveTitle('Israeli Elections Explorer');
  expect(await storedLang(page)).toBeNull(); // only a default: not stored by itself

  await page.goto('http://elections.example.co.il/');
  await expect(page).toHaveTitle('סייר הבחירות לכנסת');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.goto('http://elections.example.co.il/?lang=en&map-order=biggest');
  await expect(page).toHaveTitle('Israeli Elections Explorer');
  expect(page.url()).toBe('http://elections.example.co.il/?map-order=biggest');
});

test('a stored language wins over ?lang=', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('israel-elections:v1')) localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'he' })); });
  await page.goto('/?lang=en');
  await expect(page).toHaveTitle('סייר הבחירות לכנסת');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  expect(new URL(page.url()).search).toBe('');
});

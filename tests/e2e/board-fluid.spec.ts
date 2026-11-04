import { expect, test } from '@playwright/test';

const seed = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard', hintDismissed: true })));
  await page.goto('/');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true }).click();
};

test('drag previews follow the pointer, capture release outside, and commit one undo step', async ({ page }) => {
  await seed(page);
  const row = page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true });
  const before = await row.locator('.lb-seats b').textContent();
  const slider = page.getByRole('slider', { name: 'Votes slider' });
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height / 2, { steps: 12 });
  await expect(page.locator('.app')).toHaveClass(/board-preview/);
  expect((await slider.boundingBox())!.y).toBe(box.y);
  await expect(page.locator('.baseline-mini')).toHaveCount(0);
  await expect(row.locator('.lb-seats b')).not.toHaveText(before!);
  await expect(row.locator('.lb-bar > i').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.chamber .seat').first()).toHaveCSS('transition-duration', '0s');
  await page.mouse.move(box.x + box.width * .8, box.y - 60);
  await page.mouse.up();
  await expect(page.locator('.app')).not.toHaveClass(/board-preview/);
  const after = await row.locator('.lb-seats b').textContent();
  expect(after).not.toEqual(before);
  await page.getByRole('button', { name: /^Undo/ }).click();
  await expect(row.locator('.lb-seats b')).toHaveText(before!);
  await page.getByRole('button', { name: /^Redo/ }).click();
  await expect(row.locator('.lb-seats b')).toHaveText(after!);
});

test('seat feedback reserves row height and honours reduced motion, including undo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seed(page);
  const row = page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'Likud', exact: true });
  const height = (await row.boundingBox())!.height;
  const before = await row.locator('.lb-seats b').textContent();
  const votes = page.getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1800000'); await votes.press('Enter');
  await expect(row.locator('.lb-seats b')).not.toHaveText(before!);
  expect((await row.boundingBox())!.height).toBe(height);
  await expect(row.locator('.lb-seats b')).toHaveCSS('animation-name', 'none');
  await expect(row.locator('.lb-bar > i').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.chamber .seat').first()).toHaveCSS('transition-duration', '0s');
  await page.getByRole('button', { name: /^Undo/ }).click();
  await expect(row.locator('.lb-seats b')).toHaveText(before!);
  expect((await row.boundingBox())!.height).toBe(height);
});

test('closing an editor cancels its pending preview', async ({ page }) => {
  await seed(page);
  const slider = page.getByRole('slider', { name: 'Votes slider' });
  await slider.focus();
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('.app')).toHaveClass(/board-preview/);
  await page.keyboard.press('Escape');
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('.side-panel')).toHaveCount(0);
  await expect(page.locator('.app')).not.toHaveClass(/board-preview/);
  await expect(page.getByRole('button', { name: /^Undo/ })).toBeDisabled();
});

test('crossing a majority highlights the existing count in either direction', async ({ page }) => {
  await seed(page);
  const count = page.locator('.corridor').first().locator('.label > b');
  const before = Number(await count.textContent());
  expect(before).toBeLessThan(61);
  const votes = page.getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1800000'); await votes.press('Enter');
  await expect.poll(async () => Number(await count.textContent())).toBeGreaterThanOrEqual(61);
  await expect(count).toHaveCSS('animation-name', 'tick');
  await page.getByRole('button', { name: /^Undo/ }).click();
  await expect(count).toHaveText(String(before));
  await expect(count).toHaveCSS('animation-name', 'tick');
});

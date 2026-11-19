import { expect, type Page } from './fixtures';

/** Opens a tool from its tab. A greyed-out tab asks first (owner, 16 Nov 2026): the tool is added to Custom (or
 *  shown again), on top of the complexity the test chose. */
export async function openTool(page: Page, id: string) {
  const tab = page.locator(`#tab-${id}`);
  const locked = await tab.evaluate(e => e.classList.contains('locked') && e.getAttribute('aria-selected') !== 'true');
  await tab.click();
  if (!locked) return;
  const ask = page.locator('dialog.tool-ask');
  await ask.getByRole('button', { name: /^(Add to |Show it again|הוספה ל|להציג שוב)/ }).click();
  await expect(ask).toHaveCount(0);
}

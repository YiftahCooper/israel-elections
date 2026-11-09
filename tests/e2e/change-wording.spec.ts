import { expect, test, type Page } from '@playwright/test';
import { barPart, closeBarMenu } from './barMenu.ts';
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
async function start(page: Page, lang: 'en' | 'he', width: number, reference?: string) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true, markOfficial: false })), lang);
  const hash = reference ? '#s=' + deflateRawSync(JSON.stringify({e:'k25', n:reference, b:ds.buildInfo.builtAt, l:[{type:'setVotes',listId:ds.lists[0].id,votes:1200000}]})).toString('base64url') : '';
  await page.goto('/' + hash);
  await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
  await page.evaluate(() => document.fonts.ready);
}
async function changeThree(page: Page, lang: 'en' | 'he') {
  await page.locator('.lb-row').nth(6).click();
  const plus = page.locator('.side-panel').getByRole('button', { name: lang === 'he' ? /^הוספת קולות/ : /^Increase Votes/ }).first();
  for (let i = 0; i < 3; i++) await plus.click();
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo(0, 0));
}
for (const lang of ['en', 'he'] as const) for (const width of [390, 1024, 1500]) {
  test(`changes and History avoid repetition and clipping (${lang}, ${width})`, async ({ page }) => {
    await start(page, lang, width);
    const session = page.locator('.session'), label = session.locator(':scope > b');
    await expect(label).toHaveText(lang === 'he' ? 'אין שינויים' : 'No changes', { useInnerText: true });
    await changeThree(page, lang);
    const full = lang === 'he' ? '3 שינויים מהתוצאה הרשמית' : '3 changes from the official result';
    const short = lang === 'he' ? '3 שינויים' : '3 changes';
    await expect(label).toHaveText(width === 390 ? short : full, { useInnerText: true });
    await expect(label).toHaveAttribute('title', full);
    const historyButton = session.getByRole('button', { name: lang === 'he' ? 'היסטוריה' : 'History', exact: true });
    await expect(historyButton).not.toContainText(/\d/);
    expect(await label.evaluate(el => {
      const box = el.getBoundingClientRect(), text = el.querySelector('.fit-label-text')!.getBoundingClientRect();
      return text.left >= box.left - 1 && text.right <= box.right + 1;
    })).toBe(true);
    await historyButton.click();
    const history = session.locator('.history');
    await expect(history.locator('li')).toHaveCount(3);
    await expect(history).toContainText(full);
    for (const time of await history.locator('li .tiny').allTextContents()) expect(time).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    await page.keyboard.press('Escape');
    await session.getByRole('button', { name: lang === 'he' ? 'השינויים שלכם' : 'Your changes', exact: true }).click();
    await expect(session.locator('.info .pop')).toContainText(lang === 'he' ? 'מהתוצאה הרשמית' : 'from the official result');
    await page.keyboard.press('Escape');
    await (await barPart(page, '.scenario-switcher .choice-trigger')).click();
    await expect(page.locator('.scenario-changes summary')).toContainText(full);
    await page.keyboard.press('Escape');
  });
  test(`saved reference fits by measurement, including long names (${lang}, ${width})`, async ({ page }) => {
    test.setTimeout(120000);
    for (const name of ['Unity', '2026 Unity', 'אחדות', 'Unity with a deliberately very long saved scenario name that cannot fit in the available label space'.repeat(2)]) {
      await start(page, lang, width, name);
      await changeThree(page, lang);
      const full = lang === 'he' ? `3 שינויים מ${name === 'אחדות' ? '' : '־'}${name}` : `3 changes from ${name}`;
      const label = page.locator('.session > b');
      await expect(label).toHaveAttribute('title', full);
      const compact = lang === 'he' ? `3 מ${name === 'אחדות' ? '' : '־'}${name}` : `3 from ${name}`;
      const named = name.length > 100 || width === 390;
      await expect(label).toHaveAttribute('data-mode', named ? 'reference' : 'full');
      await expect(label.locator('.fit-label-text')).toHaveText(named ? compact : full);
      expect(await label.evaluate(el => {
        const box = el.getBoundingClientRect(), text = el.querySelector('.fit-label-text')!.getBoundingClientRect();
        const prefix = el.querySelector<HTMLElement>('.fit-label-prefix');
        return text.left >= box.left - 1 && text.right <= box.right + 1
          && (!prefix || prefix.scrollWidth <= prefix.clientWidth + 1);
      })).toBe(true);
      if (named) {
        await expect(label.locator('.fit-label-name')).toHaveText(name);
        await expect(label.locator('.fit-label-name')).toHaveCSS('text-overflow', 'ellipsis');
        expect(await label.evaluate(el => el.querySelector('.fit-label-reference-measure')!.getBoundingClientRect().width <= el.getBoundingClientRect().width + 1)).toBe(true);
        if (name.length > 100) expect(await label.locator('.fit-label-name').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
      }
      await page.locator('.session').getByRole('button', {name:lang === 'he' ? 'היסטוריה' : 'History',exact:true}).click();
      const heading = page.locator('.history-counts');
      await expect(heading).toHaveText(full + (lang === 'he' ? ' · 4 מהתוצאה הרשמית' : ' · 4 from the official result'));
      await expect(page.locator('.session .history li')).toHaveCount(4);
      await page.keyboard.press('Escape');
      await (await barPart(page, '.scenario-switcher .choice-trigger')).click();
      await expect(page.locator('.scenario-changes summary')).toContainText(full);
      await page.keyboard.press('Escape');
      // phones: the switcher lives in the Menu, which stays open (and in view under the pinned bar) until closed
      await closeBarMenu(page);
      await page.locator('.session').getByRole('button', {name:lang === 'he' ? 'השינויים שלכם' : 'Your changes',exact:true}).click();
      await expect(page.locator('.session .info .pop bdi')).toHaveText(name);
      await page.keyboard.press('Escape');
      // Resizing the same loaded reference must recover the full label when it fits.
      if (name === 'Unity') {
        await page.setViewportSize({width:390,height:1000});
        await expect(label).toHaveAttribute('data-mode', 'reference');
        await expect(label.locator('.fit-label-text')).toHaveText(compact);
        await page.setViewportSize({width:1500,height:1000});
        await expect(label).toHaveText(full, {useInnerText:true});
        // Container-only resizing at an unchanged viewport must also update the copy.
        await page.locator('.session').evaluate(el => el.style.inlineSize = '310px');
        await expect(label).toHaveAttribute('data-mode', 'reference');
        await expect(label.locator('.fit-label-text')).toHaveText(compact);
        // If even the protected prefix plus the first grapheme and ellipsis cannot fit,
        // keep just the same count, with its reference retained in the title and History.
        await label.evaluate(el => el.style.maxInlineSize = '20px');
        await expect(label).toHaveAttribute('data-mode', 'short');
        await expect(label.locator('.fit-label-text')).toHaveText('3');
        await expect(label).toHaveAttribute('title', full);
        await page.locator('.session').getByRole('button', {name:lang === 'he' ? 'היסטוריה' : 'History',exact:true}).click();
        await expect(page.locator('.history-counts')).toHaveText(full + (lang === 'he' ? ' · 4 מהתוצאה הרשמית' : ' · 4 from the official result'));
        await page.keyboard.press('Escape');
        await label.evaluate(el => el.style.removeProperty('max-inline-size'));
        await page.locator('.session').evaluate(el => el.style.removeProperty('inline-size'));
        await expect(label).toHaveText(full, {useInnerText:true});
      }
    }
  });
}

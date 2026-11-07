import { expect, test } from '@playwright/test';
for (const theme of ['light','dark']) for (const lang of ['en', 'he']) for (const width of [1500, 1024, 390]) test(`independent panels and stationary edits ${lang} ${theme} ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(({lang,theme}) => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme,level:'expert',hintDismissed:true})), {lang,theme});
  await page.goto('/');
  await page.locator('.lb-row').first().click();
  await page.evaluate(() => window.scrollTo(0, Math.min(120, document.body.scrollHeight-innerHeight)));
  const y = await page.evaluate(() => scrollY);
  const panel = page.locator('.side-panel');
  await expect.poll(() => panel.locator('.sp-head').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  if (width > 1100) expect(await panel.locator('.sp-head').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(await page.locator('.toolbar').evaluate(el => el.getBoundingClientRect().bottom));
  const votes = panel.getByRole('textbox', {name:lang==='en'?'Votes':'קולות',exact:true});
  for (const value of ['1200000','900000','1100000']) {
    await votes.fill(value); await votes.press('Enter');
    await page.waitForTimeout(150);
    expect(Math.abs(await page.evaluate(() => scrollY)-y)).toBeLessThanOrEqual(3);
  }
  const headerY = await panel.locator('.sp-head').evaluate(el => el.getBoundingClientRect().top);
  await panel.getByRole('button', {name: lang === 'en' ? 'Increase Votes' : 'הוספת קולות', exact:true}).click();
  await panel.getByRole('button', {name:lang==='en'?'Increase Seats':'הוספת מנדטים', exact:true}).click();
  await page.keyboard.press('Control+z'); await page.keyboard.press('Control+Shift+z');
  expect(Math.abs(await page.evaluate(() => scrollY)-y)).toBeLessThanOrEqual(3);
  await panel.locator('.sp-body').evaluate(el => el.scrollTop=el.scrollHeight);
  expect(await panel.locator('.sp-head').evaluate(el => el.getBoundingClientRect().top)).toBe(headerY);
});
for (const theme of ['light','dark']) for (const width of [1500,1024,390]) for (const lang of ['en','he']) test(`figure popovers leave every sibling and page stationary ${lang} ${theme} ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.addInitScript(({lang,theme})=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme,level:'expert',hintDismissed:true})),{lang,theme});
  await page.goto('/'); await expect(page.locator('.fig')).toHaveCount(7);
  await page.locator('.figures').scrollIntoViewIfNeeded();
  const positions=()=>page.locator('.fig').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
  for(const fig of await page.locator('.fig').all()) {
    await fig.scrollIntoViewIfNeeded();
    const before=await positions(), y=await page.evaluate(()=>scrollY);
    await fig.locator(':scope > button').click();
    await expect(fig.locator('.more')).toBeVisible();
    expect(await positions()).toEqual(before); expect(await page.evaluate(()=>scrollY)).toBe(y);
    await page.keyboard.press('Escape');
    await expect(fig.locator('.more')).not.toBeVisible();
  }
});
for (const theme of ['light','dark']) for (const lang of ['en','he']) for (const width of [1500,390]) test(`bottom info stays inside viewport without trailing space ${lang} ${theme} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844});
 await page.addInitScript(v=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v)),{lang,theme,level:'expert',hintDismissed:true});
 await page.goto('/');await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
 const info=page.locator('.blocs-head .info > button');await info.scrollIntoViewIfNeeded();
 await page.evaluate(()=>{const r=document.querySelector('.blocs-head .info > button')!.getBoundingClientRect(); scrollBy(0,r.bottom-(innerHeight-28));});
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);
 await info.hover();const tip=page.locator('.blocs-head .info .pop');await expect(tip).toBeVisible();
 const box=(await tip.boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(7);expect(box.x).toBeGreaterThanOrEqual(7);
 expect(box.y+box.height).toBeLessThanOrEqual(837);expect(box.x+box.width).toBeLessThanOrEqual(width-7);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBe(height);
 await tip.evaluate(el => { el.textContent = (el.textContent ?? '').repeat(80); });
 await expect.poll(() => tip.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(837);
 expect(await tip.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
 await page.screenshot({path:`.backup-scratch/layout/after/f18-${lang}-${theme}-${width}.png`});
 await page.mouse.move(0,0);await page.keyboard.press('Escape');
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await expect(page.locator('.work > p')).toHaveCount(0);
 const end=await page.locator('.board').evaluate(el=>el.getBoundingClientRect().bottom);
 expect(844-end).toBeLessThanOrEqual(29);
 await page.locator('.band .election-about summary').click();
 await expect(page.locator('.band .independence-note')).toContainText(lang==='en'?'Independent election simulator':'סימולטור בחירות עצמאי');
});

for(const width of [1500,390]) test(`chamber hover card stays inside a short viewport ${width}`,async({page})=>{
 await page.setViewportSize({width,height:500});await page.goto('/');
 const seat=page.locator('.chamber [data-seat]').last();await seat.scrollIntoViewIfNeeded();await seat.hover();
 const tip=page.locator('.chamber .tip');await expect(tip).toBeVisible();
 const box=(await tip.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(7);expect(box.y).toBeGreaterThanOrEqual(7);expect(box.x+box.width).toBeLessThanOrEqual(width-7);expect(box.y+box.height).toBeLessThanOrEqual(493);
});

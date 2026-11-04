import { expect, type Locator } from '@playwright/test';
export async function choose(picker: Locator, value: string | { label: string }) {
  await picker.click();
  const dialog = picker.page().getByRole('dialog').last();
  const option = typeof value === 'string' ? dialog.locator(`[data-choice-value="${value}"]`) : dialog.locator('.choice-option').filter({ has: dialog.page().getByText(value.label, { exact: true }) });
  await option.click();
  const open = dialog.getByRole('button', { name: /^(Open|פתיחה)$/, exact: true });
  if (await open.count()) await open.click();
  await expect(dialog).not.toBeVisible();
}

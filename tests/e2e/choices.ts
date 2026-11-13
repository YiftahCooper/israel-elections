import { expect, type Locator } from '@playwright/test';
export async function choose(picker: Locator, value: string | { label: string }) {
  const dialogId = await picker.getAttribute('aria-controls');
  // read before choosing: a picker inside the phone menu goes away with the menu once a choice is made
  const pickerLabel = await picker.getAttribute('aria-label');
  await picker.click();
  const dialog = dialogId ? picker.page().locator(`[id="${dialogId}"]`) : 
    // only a dialog that holds choices: a seat card that opens under the resting pointer is a dialog too
    picker.page().getByRole('dialog').filter({ has: picker.page().locator('[data-choice-value]') }).last();
  const option = typeof value === 'string' ? dialog.locator(`[data-choice-value="${value}"]`) : dialog.locator('.choice-option').filter({ has: dialog.page().getByText(value.label, { exact: true }) });
  const selectedValue = await option.getAttribute('data-choice-value');
  await option.click();
  const open = dialog.getByRole('button', { name: /^(Open|פתיחה)$/, exact: true });
  if (await open.count()) await open.click();
  await expect(dialog).not.toBeVisible();
  // Closing the election dialog starts an async load; wait for the committed election.
  if (selectedValue && ['Election','בחירות'].includes(pickerLabel ?? ''))
    await expect(picker).toHaveAttribute('data-value', selectedValue);
}

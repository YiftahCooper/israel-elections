/** The app's own questions, in the app's language and look, instead of the browser's confirm and prompt boxes (whose
 *  buttons follow the browser's language and ignore the app's theme). A small modal dialog in the style of the other
 *  questions (.tool-ask): the confirming button answers; Cancel, Escape or a tap outside cancels; focus returns to
 *  where it was. Built without React so any click handler can await it. */
interface Ask { title: string; text?: string; yes: string; no: string; danger?: boolean; input?: { label: string; value?: string } }

let seq = 0;
function ask(o: Ask): Promise<string | null> {
  return new Promise((resolve) => {
    const previous = document.activeElement as HTMLElement | null;
    const id = `app-ask-${++seq}`;
    const d = document.createElement('dialog');
    d.className = 'tool-ask app-ask';
    d.setAttribute('aria-labelledby', `${id}-title`);
    const h = document.createElement('h2'); h.id = `${id}-title`; h.textContent = o.title; d.append(h);
    if (o.text) { const p = document.createElement('p'); p.id = `${id}-text`; p.textContent = o.text; d.append(p); d.setAttribute('aria-describedby', p.id); }
    let field: HTMLInputElement | null = null;
    const form = document.createElement('form');
    if (o.input) {
      const label = document.createElement('label'); label.className = 'app-ask-field';
      const span = document.createElement('span'); span.className = 'small ink2'; span.textContent = o.input.label;
      field = document.createElement('input'); field.type = 'text'; field.value = o.input.value ?? ''; field.setAttribute('aria-label', o.input.label);
      label.append(span, field); form.append(label);
    }
    const actions = document.createElement('div'); actions.className = 'tool-ask-actions';
    const yes = document.createElement('button'); yes.type = 'submit'; yes.className = `btn primary${o.danger ? ' danger' : ''}`; yes.textContent = o.yes;
    const no = document.createElement('button'); no.type = 'button'; no.className = 'btn ghost'; no.textContent = o.no;
    actions.append(yes, no); form.append(actions); d.append(form);
    let answer: string | null = null;
    const finish = () => { d.remove(); previous?.focus({ preventScroll: true }); resolve(answer); };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (field && !field.value.trim()) { field.focus(); return; }
      answer = field ? field.value.trim() : 'yes'; d.close();
    });
    no.addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    // the app's own keyboard shortcuts (Ctrl+Z and the like) must not act behind an open question
    d.addEventListener('keydown', (e) => e.stopPropagation());
    d.addEventListener('close', finish, { once: true });
    document.body.append(d);
    d.showModal();
    (field ?? yes).focus();
    field?.select();
  });
}

/** Yes or no: true only when the confirming button was pressed. */
export const askConfirm = (o: Omit<Ask, 'input'>) => ask(o).then((a) => a !== null);
/** A short text such as a name: the trimmed text, or null when cancelled. */
export const askText = (o: Omit<Ask, 'input'> & { label: string; value?: string }) => ask({ ...o, input: { label: o.label, value: o.value } });

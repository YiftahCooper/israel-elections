import { dispatch, scenarioKey, useStore } from '../store.ts';
import { useL } from '../i18n.ts';
import { SCENARIO_COLOUR_NAMES, SCENARIO_PALETTE, liveScenarioColor, savedColor } from '../scenarioIdentity.ts';

/** The scenario's own colour at the point of use (owner, 19 Nov 2026): the colour the top bar takes while the scenario
 *  is open and that sits beside its name in every list of scenarios. Each of the eight is distinct from the others; one
 *  already given to a saved scenario says so. The official result has no colour of its own, so this is not offered
 *  there. Choosing one is never a change to the result. The Scenarios page has the full picker. */
export function ScenarioColour() {
  const L = useL();
  const s = useStore(st => st.scenario), saved = useStore(st => st.saved);
  const official = useStore(st => (scenarioKey(st) ?? 'official') === 'official');
  if (!s || official) return null;
  const current = liveScenarioColor(s, saved).toLowerCase();
  const usedBy = (c: string) => saved.filter(x => x.id !== s.id && x.log.some(a => a.type === 'setIdentityColor') && savedColor(x.log).toLowerCase() === c.toLowerCase()).map(x => x.name);
  return <div className="scenario-colour" role="group" aria-label={L('Scenario colour', 'צבע התרחיש')}>
    <span className="scenario-colour-label">{L('Colour', 'צבע')}</span>
    {SCENARIO_PALETTE.map((c, i) => {
      const used = usedBy(c), name = L(...SCENARIO_COLOUR_NAMES[i]);
      const title = used.length ? L(`${name} · also ${used.join(', ')}`, `${name} · גם ${used.join(', ')}`) : name;
      return <button key={c} type="button" aria-pressed={current === c.toLowerCase()} className="scenario-colour-swatch" data-used={used.length ? '' : undefined}
        style={{ background: c }} title={title} aria-label={title}
        onClick={() => { if (current !== c.toLowerCase()) dispatch({ type: 'setIdentityColor', color: c }); }} />;
    })}
  </div>;
}

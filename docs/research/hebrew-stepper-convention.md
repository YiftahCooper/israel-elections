# Hebrew numeric controls

Inspected 5 November 2026. Question: should ± controls and numeric ranges mirror with Hebrew text?

## Evidence

Prior research: [Israeli interfaces](prior-art-israel.md) and [families and controls](prior-art-families-and-controls.md) establish Hebrew page/text layout and election visual references, but do not establish a universal ± convention. Their earlier observations are background, not new measurements.

| Public source | Observation in this inspection | Proof limit |
| --- | --- | --- |
| [Mizrahi-Tefahot mortgage calculator](https://www.mizrahi-tefahot.co.il/mortgages/calculator/) (redirected from `/mortgages/mortgage-calculator/`) | Visible house-price slider: 400,000 at left, 10,000,000 at right, thumb at left at minimum. Visible equity slider also has computed `direction: ltr`. Native ranges `customRange1` and `customRange2` have ascending min/max. | Direct screenshot and DOM evidence for LTR **ranges**, not a ± stepper or all bank interfaces. Hidden later-stage sliders were excluded from the visual conclusion. |
| [gov.il attempted service](https://www.gov.il/he/service/calculation_of_mortgage_repayment) | Redirected to `/he/error`, Hebrew page-not-found message. | Accessed, but provides no numeric-control evidence. |
| [ACE](https://www.ace.co.il/) and [linked category](https://www.ace.co.il/perfumes-pharm/114050000) | Hebrew retail page delivered. No usable ± quantity control established in the inspected homepage/category. | Negative bounded inspection; not evidence that the shop lacks quantity controls. No cart, account or order used. |
| [Polimeter coalition explorer](https://polimeter.co.il/coalition) | Hebrew coalition selection/chamber interface delivered. No native numeric range or standalone ± button was established by the inspected DOM. | No conclusion about numeric orientation. External data links were not followed; no political data reused. |

**Inference / decision:** This is insufficient evidence of an Israeli-wide ± convention. The bank provides a concrete LTR range example compatible with the owner's stated mathematics/graphics rule. Apply that rule consistently: minus, value, plus from left to right; slider minimum at left, maximum at right; right arrow increases a native range. Hebrew labels, grouping and page layout remain RTL. This is an explicit product decision, not a claim about Israeli user expectations.

## Application and reproduction

`NumericStepper` covers list votes/seats/share, bloc votes and turnout/electorate controls; its numeric row is LTR. Family scale's separate ± row is LTR. All native `input[type=range]` controls, including merger retention and split share, are LTR. The vote slider's endpoint row follows the slider. Existing numeric field bidi isolation remains. Tests assert the same ± order in both languages.

Browser: repository Playwright / Chromium, 1440×900 desktop, user agent `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Read source URLs normally; no challenge, login or paywall bypass; no English Wikipedia. Screenshots and runner are disposable under `.backup-scratch/rc-audit/prefs/research-*` and `research.mjs` / `shop.mjs`. The bank capture was visually inspected. Public pages can change; URLs, observed values and DOM identifiers above retain the conclusion without depending on scratch.

## Action-time preference audit

| Candidate | Decision and reason |
| --- | --- |
| Vote balancing source for list/bloc edits | Ask at completed action. Explicit local/global commit, registry-driven Settings; old remembered source migrates. Remembered named donor is re-asked only if incompatible, with explanation behind info. |
| Difference baseline when opening a saved scenario | Ask at explicit open: loaded scenario or official result. It changes how the next edits appear; formerly required finding Scenarios settings. No question for initial load, share-link load or restored workspace. |
| Family vote source, scale mode, mixed-list policy | Inline controls already beside the preview/action and show their current answer; keep them there. The family source remains the shared current source. |
| Step size, target seats, transfer partner | Inline controls already adequate. A dialog would interrupt repeated edits. |
| Chamber layout/color, language, theme, level | Inline controls already adequate; the user explicitly selects these views. No load-time questionnaire. |
| Percent precision | Not worth a question: formatting only, uncommon action dependency. Keep Rules control. |
| Merge retention, split ratio, grouping, electoral rules | Inline controls already adequate and part of the action's visible parameters. Do not turn scenario facts into global subjective preferences. |
| Reset/delete confirmations | Not preferences: retain confirmation instead of remembering consent to destructive actions. |

One registry, one active question, one persisted answer map. Local answers last for the current target; Always applies globally. Settings can clear every answer back to Ask each time. Native dialog traps focus and returns it to the invoking control; focus starts on the dialog so the Enter finishing an edit cannot choose a default.

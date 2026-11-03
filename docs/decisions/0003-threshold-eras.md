# Election-specific statutory threshold eras

## Context

The original application hard-coded the 2014 threshold when restoring historical mode.
That would incorrectly impose 3.25% on elections held before 2015.

## Decision

Define exact presets for 1.5% (3/200), 2% (1/50), and 3.25% (13/400). Map election 16
to the first, 17–19 to the second, and 20–26 to the third. The threshold changed during
the 16th Knesset's tenure in May 2004, after its own election. It changed again during
the 19th Knesset in March 2014, after its own election. Dataset ruleSetId selects the
preset; restoring historical mode uses the same historical base or election mapping.

The Knesset's institutional threshold history and the CEC's contemporaneous 2006
explanation independently establish those boundaries. Exhaustive comparison with the
historical amendment texts remains outstanding and is disclosed in ELECTORAL-LAW.md.

## Alternatives considered

Floating-point percentages introduce unnecessary boundary ambiguity. Selecting rules by
the date a scenario is edited or by the sitting Knesset at amendment time gives the wrong era.

## Consequences

Tests exercise all eleven election IDs through dataset initialization and experimental-to-
historical reset. Bader–Ofer and the other existing rules remain shared. These tests are
rule-plumbing evidence, not actual historical seat-reproduction evidence.

## Sources

* https://main.knesset.gov.il/About/Lexicon/pages/qualifying-threshold.aspx
* https://www.gov.il/apps/elections/elections-knesset-17/heb/about/ElectoralSystem.html
* https://fs.knesset.gov.il/globaldocs/MMM/d5c6ad87-7f7a-eb11-810c-00155d0aee38/2_d5c6ad87-7f7a-eb11-810c-00155d0aee38_11_17733.pdf

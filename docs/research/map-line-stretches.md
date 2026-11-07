# OCHA / OSM disagreement atlas

7 November 2026. All continuous source-line portions outside a 100 m buffer of the opposite dataset are included, grouped when within 150 m. Buffer discretization is below 0.008 m; maxima are sampled at intervals no greater than 10 m. WGS84 coordinates are longitude/latitude. Maximum values are 10 m sampled distances, not cadastral errors. Each figure is a cropped comparison of the retained source vectors; green is OCHA, purple is OSM. No map background or settlement label is invented.

Generated figures belong in `.backup-scratch/v4/map-line-checks/`. Recreate them with the audit and archive scripts described in [the reproduction instructions](map-lines.md#reproduction). No PNGs are retained in docs.

The historical interpretation is separated from the numerical observation. For ordinary stretches, a particular adjustment is **not** inferred merely from an offset. See [the source and decision report](map-lines.md).

## Judea and Samaria · 1

- Bounding coordinates: `[35.22810095357335, 32.52965586152027, 35.243709655491216, 32.546302082793055]`.
- Maximum sampled deviation: **171.2 m** at `[35.239610208000045, 32.531516364000026]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.22810095357335, 32.545950144251414]` → `[35.23031845049176, 32.54282470467702]`; max 148.1 m.
  - Continuous portion 2, OCHA to OSM: `[35.23071537895355, 32.54222493167272]` → `[35.243037544909626, 32.52965586152027]`; max 171.2 m.
  - Continuous portion 3, OSM to OCHA: `[35.229096509060795, 32.546302082793055]` → `[35.2312060921677, 32.543332594396]`; max 142.0 m.
  - Continuous portion 4, OSM to OCHA: `[35.23165666178485, 32.54264920387429]` → `[35.2409656, 32.5325519]`; max 171.0 m.
  - Continuous portion 5, OSM to OCHA: `[35.2409656, 32.5325519]` → `[35.243709655491216, 32.530357566872]`; max 163.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 2

- Bounding coordinates: `[35.17023705265255, 32.513574989779876, 35.22424653665997, 32.553847828000066]`.
- Maximum sampled deviation: **640.1 m** at `[35.1871259, 32.5236877]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.17023705265255, 32.51408243621055]` → `[35.17663428601669, 32.52118168315435]`; max 236.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.17113821095279, 32.513574989779876]` → `[35.17761896928667, 32.520752615148766]`; max 236.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.178426075445486, 32.521850289364224]` → `[35.1892871, 32.5262341]`; max 640.1 m.
  - Continuous portion 4, OCHA to OSM: `[35.17756426440369, 32.52240909151806]` → `[35.22424653665997, 32.55300675366952]`; max 581.9 m.
  - Continuous portion 5, OSM to OCHA: `[35.1892871, 32.5262341]` → `[35.2046865, 32.5410395]`; max 576.7 m.
  - Continuous portion 6, OSM to OCHA: `[35.2091551, 32.542520599999996]` → `[35.22386539358935, 32.5518434473597]`; max 482.5 m.
  - Continuous portion 7, OSM to OCHA: `[35.2046865, 32.5410395]` → `[35.2091551, 32.542520599999996]`; max 326.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 3

- Bounding coordinates: `[35.248559558744546, 32.51920257827108, 35.263339403486434, 32.52699377596606]`.
- Maximum sampled deviation: **216.5 m** at `[35.2525063, 32.5230593]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.2492108489909, 32.52699377596606]` → `[35.263339403486434, 32.51999427245994]`; max 216.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.248559558744546, 32.526271590714906]` → `[35.26282228485086, 32.51920257827108]`; max 216.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 4

- Bounding coordinates: `[35.268938147585814, 32.509565, 35.364349930460904, 32.52317350500004]`.
- Maximum sampled deviation: **544.4 m** at `[35.3490771, 32.51818000000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.26926863946971, 32.517772357231536]` → `[35.364349930460904, 32.51800858433147]`; max 536.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.3085243, 32.51051089999999]` → `[35.36398815503734, 32.517145898544406]`; max 544.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.268938147585814, 32.51690551585354]` → `[35.3085243, 32.51051089999999]`; max 316.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 5

- Bounding coordinates: `[35.37834569250421, 32.50137547096572, 35.40241779481223, 32.51153440965845]`.
- Maximum sampled deviation: **438.7 m** at `[35.3843387, 32.5050686]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.37879763985671, 32.51153440965845]` → `[35.40241779481223, 32.50226973313762]`; max 384.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.37834569250421, 32.510710632094714]` → `[35.4018225295003, 32.50137547096572]`; max 438.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 6

- Bounding coordinates: `[35.15698131012034, 32.503281863176966, 35.16220283000536, 32.50687387378933]`.
- Maximum sampled deviation: **177.2 m** at `[35.1606613, 32.504194299999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.15698131012034, 32.5041188563707]` → `[35.16136324221786, 32.50687387378933]`; max 172.4 m.
  - Continuous portion 2, OSM to OCHA: `[35.15738849061116, 32.503281863176966]` → `[35.16220283000536, 32.506300787489614]`; max 177.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 7

- Bounding coordinates: `[35.140876188275534, 32.4963075, 35.151870148240555, 32.501214730314985]`.
- Maximum sampled deviation: **225.7 m** at `[35.1447483, 32.4963148]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.140876188275534, 32.497223203891956]` → `[35.15133069400057, 32.501214730314985]`; max 221.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.141185322105045, 32.496320267158]` → `[35.151870148240555, 32.50043450578888]`; max 225.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 8

- Bounding coordinates: `[35.4041081, 32.491496771424686, 35.40641838400007, 32.49581116348641]`.
- Maximum sampled deviation: **153.1 m** at `[35.40619712700004, 32.49475751300002]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.40520376381503, 32.49581116348641]` → `[35.40630424340283, 32.49354866161891]`; max 153.1 m.
  - Continuous portion 2, OCHA to OSM: `[35.406347372225, 32.49324580917986]` → `[35.40627274257228, 32.49153355417341]`; max 113.8 m.
  - Continuous portion 3, OSM to OCHA: `[35.40411130025608, 32.4954741982408]` → `[35.4052629458875, 32.49333664985284]`; max 151.8 m.
  - Continuous portion 4, OSM to OCHA: `[35.40527831630067, 32.49322872706485]` → `[35.40519909338163, 32.491496771424686]`; max 114.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 9

- Bounding coordinates: `[35.4050953, 32.46231800875978, 35.420785110000054, 32.489961613607115]`.
- Maximum sampled deviation: **606.1 m** at `[35.4087304, 32.477645700000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.40679659279253, 32.489961613607115]` → `[35.42004731963819, 32.46242539171897]`; max 605.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.4189469, 32.4623438]` → `[35.418958395785396, 32.46231800875978]`; max 101.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.40578900985031, 32.48966599633264]` → `[35.4189469, 32.4623438]`; max 606.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 10

- Bounding coordinates: `[35.075410696528216, 32.46232417774462, 35.1399595, 32.4953254438093]`.
- Maximum sampled deviation: **445.9 m** at `[35.09314274600007, 32.48050581200005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.075410696528216, 32.463046228737284]` → `[35.137107911898234, 32.4953254438093]`; max 445.9 m.
  - Continuous portion 2, OSM to OCHA: `[35.098968, 32.478098200000005]` → `[35.13793202746114, 32.4947322743411]`; max 441.7 m.
  - Continuous portion 3, OSM to OCHA: `[35.083155, 32.4681846]` → `[35.098968, 32.478098200000005]`; max 431.4 m.
  - Continuous portion 4, OSM to OCHA: `[35.0792625, 32.4650534]` → `[35.083155, 32.4681846]`; max 258.8 m.
  - Continuous portion 5, OSM to OCHA: `[35.07613530529831, 32.46232417774462]` → `[35.0792625, 32.4650534]`; max 208.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 11

- Bounding coordinates: `[35.42013917426447, 32.45870870135774, 35.4203042, 32.45901569239965]`.
- Maximum sampled deviation: **110.6 m** at `[35.4202974, 32.4588294]`.
- Directions: OSM to OCHA.
  - Continuous portion 1, OSM to OCHA: `[35.42024425496027, 32.45901569239965]` → `[35.42013917426447, 32.45870870135774]`; max 110.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 12

- Bounding coordinates: `[35.4158149, 32.45370787000422, 35.41807738357329, 32.45677011325128]`.
- Maximum sampled deviation: **174.8 m** at `[35.4160774, 32.4560795]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.41807738357329, 32.45614292834557]` → `[35.41705164597828, 32.45370787000422]`; max 165.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.41721247091163, 32.45677011325128]` → `[35.41600984953513, 32.45389583704953]`; max 174.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 13

- Bounding coordinates: `[35.069173192464845, 32.452633064498585, 35.0734643, 32.45706362175685]`.
- Maximum sampled deviation: **251.1 m** at `[35.0728119, 32.45444390000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.069173192464845, 32.45344288887974]` → `[35.07141516975739, 32.45706362175685]`; max 250.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.06979795437804, 32.452633064498585]` → `[35.0734558, 32.45587150000001]`; max 251.1 m.
  - Continuous portion 3, OSM to OCHA: `[35.0734558, 32.45587150000001]` → `[35.07259396819789, 32.45702878255548]`; max 231.3 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 14

- Bounding coordinates: `[35.06302160073294, 32.440746655594104, 35.0658243, 32.447846462742376]`.
- Maximum sampled deviation: **259.0 m** at `[35.0658243, 32.443318000000005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.06302160073294, 32.441122511174854]` → `[35.06444929536777, 32.447846462742376]`; max 255.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.064076904904475, 32.440746655594104]` → `[35.06551321589, 32.44751104673657]`; max 259.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 15

- Bounding coordinates: `[35.0600758247629, 32.43131847097867, 35.06300868159443, 32.43837142476967]`.
- Maximum sampled deviation: **185.5 m** at `[35.0607079, 32.43666340000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.06110739210834, 32.43131847097867]` → `[35.06300868159443, 32.437595631500976]`; max 149.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.0600758247629, 32.43155650723164]` → `[35.062009064945606, 32.43837142476967]`; max 185.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 16

- Bounding coordinates: `[35.05707984946884, 32.42414671200226, 35.06062045318089, 32.4287805355521]`.
- Maximum sampled deviation: **196.4 m** at `[35.05922487000004, 32.42479545600003]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.05803493750714, 32.42414671200226]` → `[35.06062045318089, 32.42846433574435]`; max 196.4 m.
  - Continuous portion 2, OSM to OCHA: `[35.05707984946884, 32.424684014579114]` → `[35.05962165661415, 32.4287805355521]`; max 186.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 17

- Bounding coordinates: `[35.4102977, 32.405941899999995, 35.45689654807456, 32.44080313163562]`.
- Maximum sampled deviation: **792.6 m** at `[35.4410057, 32.405941899999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.41357449848266, 32.4404135417109]` → `[35.45271239646205, 32.41385995596844]`; max 660.1 m.
  - Continuous portion 2, OCHA to OSM: `[35.453486023027274, 32.41390768516521]` → `[35.45675714238547, 32.41405252610051]`; max 134.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.41250322202459, 32.44080313163562]` → `[35.4269024, 32.41204209999999]`; max 307.5 m.
  - Continuous portion 4, OSM to OCHA: `[35.4294166, 32.41018129999999]` → `[35.45288631745469, 32.41296677446602]`; max 792.6 m.
  - Continuous portion 5, OSM to OCHA: `[35.45350591007376, 32.41300500068129]` → `[35.45689654807456, 32.41313857851137]`; max 136.1 m.
  - Continuous portion 6, OSM to OCHA: `[35.4269024, 32.41204209999999]` → `[35.4294166, 32.41018129999999]`; max 400.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 18

- Bounding coordinates: `[35.45862768576488, 32.409368625467266, 35.48280444904836, 32.41390834912694]`.
- Maximum sampled deviation: **236.1 m** at `[35.47780564400006, 32.412923817000035]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.45887060005893, 32.41390834912694]` → `[35.48280444904836, 32.41007301810848]`; max 236.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.45862768576488, 32.41302048321252]` → `[35.4821278679338, 32.409368625467266]`; max 230.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 19

- Bounding coordinates: `[35.054465201594944, 32.41820696684157, 35.0572782, 32.42104126326331]`.
- Maximum sampled deviation: **187.5 m** at `[35.057014, 32.4190955]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.054465201594944, 32.418885189090126]` → `[35.05604648938315, 32.42104126326331]`; max 179.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.05520495421474, 32.41820696684157]` → `[35.057190638237806, 32.420896540702856]`; max 187.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 20

- Bounding coordinates: `[35.484688776085946, 32.406870056375695, 35.4867063668708, 32.40839088469701]`.
- Maximum sampled deviation: **111.6 m** at `[35.48658361400004, 32.40765948900002]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.48538677619531, 32.40839088469701]` → `[35.4867063668708, 32.40743939292698]`; max 111.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.484688776085946, 32.40770635669441]` → `[35.485848247784205, 32.406870056375695]`; max 109.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 21

- Bounding coordinates: `[35.05491020463398, 32.41150994367664, 35.055175, 32.412052896825216]`.
- Maximum sampled deviation: **114.2 m** at `[35.0551408, 32.4119004]`.
- Directions: OSM to OCHA.
  - Continuous portion 1, OSM to OCHA: `[35.0551559916691, 32.41150994367664]` → `[35.05491020463398, 32.412052896825216]`; max 114.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 22

- Bounding coordinates: `[35.48985537245173, 32.40236520671455, 35.49318423342565, 32.40449896442111]`.
- Maximum sampled deviation: **119.0 m** at `[35.4908101, 32.40304640000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.490452435083824, 32.40449896442111]` → `[35.49318423342565, 32.40318641224548]`; max 116.4 m.
  - Continuous portion 2, OSM to OCHA: `[35.48985537245173, 32.403742251878164]` → `[35.4927452142251, 32.40236520671455]`; max 119.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 23

- Bounding coordinates: `[35.49545698797527, 32.39999491165349, 35.50128947571433, 32.40221094025569]`.
- Maximum sampled deviation: **125.6 m** at `[35.49958844500003, 32.40145672000005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.49584225598404, 32.40221094025569]` → `[35.50128947571433, 32.400894449211656]`; max 125.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.49545698797527, 32.401370400461886]` → `[35.50108380842746, 32.39999491165349]`; max 125.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 24

- Bounding coordinates: `[35.504667042506576, 32.398911302903706, 35.50632562681301, 32.40004058240414]`.
- Maximum sampled deviation: **104.7 m** at `[35.50555869100003, 32.399968975000036]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.50495358448758, 32.40004058240414]` → `[35.50632562681301, 32.39978340210816]`; max 104.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.504667042506576, 32.39916425612084]` → `[35.50605552359278, 32.398911302903706]`; max 104.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 25

- Bounding coordinates: `[35.05434259002646, 32.405189470464265, 35.05571900800004, 32.4072704749406]`.
- Maximum sampled deviation: **121.8 m** at `[35.05563509500007, 32.405473829000066]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.05536355506218, 32.405189470464265]` → `[35.055622347956024, 32.4072704749406]`; max 121.8 m.
  - Continuous portion 2, OSM to OCHA: `[35.05434259002646, 32.40555280605029]` → `[35.05455413751837, 32.407234287590725]`; max 121.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 26

- Bounding coordinates: `[35.51109416639034, 32.391190468613026, 35.53492369171427, 32.39857746314224]`.
- Maximum sampled deviation: **258.1 m** at `[35.5202045, 32.394980899999986]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.511281538301525, 32.39857746314224]` → `[35.53492369171427, 32.39198705231403]`; max 257.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.51109416639034, 32.39768859152611]` → `[35.53438970888244, 32.391190468613026]`; max 258.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 27

- Bounding coordinates: `[35.05246580318962, 32.4022473931796, 35.053446272974654, 32.402917193327816]`.
- Maximum sampled deviation: **102.9 m** at `[35.052537415000074, 32.402826388000044]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.05246580318962, 32.40269451378351]` → `[35.052655802328744, 32.402917193327816]`; max 102.9 m.
  - Continuous portion 2, OSM to OCHA: `[35.053393252500776, 32.4022473931796]` → `[35.053446272974654, 32.40230788507954]`; max 100.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 28

- Bounding coordinates: `[35.53570489596345, 32.3870989, 35.5549603, 32.39180159600005]`.
- Maximum sampled deviation: **392.6 m** at `[35.5549603, 32.38901729999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.53631075244982, 32.39113379310618]` → `[35.54583027763866, 32.38924993328016]`; max 278.2 m.
  - Continuous portion 2, OCHA to OSM: `[35.54626714342651, 32.38935522401552]` → `[35.55226772300006, 32.39180159600005]`; max 333.5 m.
  - Continuous portion 3, OSM to OCHA: `[35.53570489596345, 32.390370245647325]` → `[35.54611503984119, 32.38834762616579]`; max 289.6 m.
  - Continuous portion 4, OSM to OCHA: `[35.54651924204828, 32.38846797658538]` → `[35.5549603, 32.38901729999999]`; max 392.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 29

- Bounding coordinates: `[35.04482643538023, 32.389574682117384, 35.049761683771, 32.39790001481312]`.
- Maximum sampled deviation: **211.3 m** at `[35.0489656, 32.3938354]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.04482643538023, 32.39038133916229]` → `[35.048453619834966, 32.397326159751785]`; max 209.3 m.
  - Continuous portion 2, OCHA to OSM: `[35.04853507008509, 32.397450817537006]` → `[35.04890773910729, 32.39790001481312]`; max 104.0 m.
  - Continuous portion 3, OSM to OCHA: `[35.04561622528422, 32.389574682117384]` → `[35.04785, 32.39163680000001]`; max 208.0 m.
  - Continuous portion 4, OSM to OCHA: `[35.04785, 32.39163680000001]` → `[35.0493944237095, 32.39690620081552]`; max 211.3 m.
  - Continuous portion 5, OSM to OCHA: `[35.04943838637216, 32.39697348369261]` → `[35.049761683771, 32.39735416906948]`; max 103.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 30

- Bounding coordinates: `[35.0401927, 32.37739446612391, 35.04590782014204, 32.38343330693528]`.
- Maximum sampled deviation: **366.7 m** at `[35.041659, 32.377733199999994]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.04590782014204, 32.37826873460162]` → `[35.043108558105104, 32.38314930214361]`; max 309.4 m.
  - Continuous portion 2, OSM to OCHA: `[35.04531482483775, 32.37739446612391]` → `[35.0417232, 32.37769610000001]`; max 364.3 m.
  - Continuous portion 3, OSM to OCHA: `[35.0417232, 32.37769610000001]` → `[35.04199174827612, 32.38343330693528]`; max 366.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 31

- Bounding coordinates: `[35.047483757526464, 32.375181332132414, 35.04924016467649, 32.376803994830865]`.
- Maximum sampled deviation: **151.8 m** at `[35.049042, 32.3765007]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.048259619437275, 32.375181332132414]` → `[35.047483757526464, 32.3761160827913]`; max 135.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.04924016467649, 32.37559997166189]` → `[35.048362783196055, 32.376803994830865]`; max 151.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 32

- Bounding coordinates: `[35.04067320900003, 32.356202992338964, 35.0516079, 32.369911431976554]`.
- Maximum sampled deviation: **351.3 m** at `[35.04794350000001, 32.3593916]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.040697055699994, 32.35629252446628]` → `[35.04964212555703, 32.36980550103999]`; max 310.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.041867349538094, 32.356202992338964]` → `[35.05073061258561, 32.369911431976554]`; max 351.3 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 33

- Bounding coordinates: `[35.025562587000024, 32.344059420240626, 35.042403577925064, 32.350808685000054]`.
- Maximum sampled deviation: **467.9 m** at `[35.02637513600007, 32.350541655000036]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.02712937848383, 32.344059420240626]` → `[35.04119885051528, 32.34897107867791]`; max 467.9 m.
  - Continuous portion 2, OSM to OCHA: `[35.028244568694085, 32.34433678182929]` → `[35.042403577925064, 32.348442133333634]`; max 356.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 34

- Bounding coordinates: `[35.01875972076302, 32.34051303672702, 35.02026714585708, 32.34187840000004]`.
- Maximum sampled deviation: **155.5 m** at `[35.01924136700006, 32.34187840000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.01875972076302, 32.341060832953346]` → `[35.020078877322156, 32.341725461620534]`; max 155.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.0197455375419, 32.34051303672702]` → `[35.02026714585708, 32.340768723572694]`; max 119.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 35

- Bounding coordinates: `[35.02551229969583, 32.33891816600004, 35.02637346634157, 32.34002139999999]`.
- Maximum sampled deviation: **108.3 m** at `[35.02558927600006, 32.33891816600004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.02551229969583, 32.33898567831587]` → `[35.0263664444876, 32.33908816479911]`; max 108.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.025898799724246, 32.33994320591401]` → `[35.02615395288073, 32.3399728632639]`; max 101.9 m.
  - Continuous portion 3, OSM to OCHA: `[35.026227294340124, 32.339988905724866]` → `[35.02637346634157, 32.340020878744504]`; max 101.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 36

- Bounding coordinates: `[35.016432188501774, 32.332694726253514, 35.01802060500006, 32.33891769233162]`.
- Maximum sampled deviation: **145.6 m** at `[35.01802060500006, 32.33524458400006]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.01749326298585, 32.332694726253514]` → `[35.01802040832994, 32.3384384576476]`; max 145.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.016432188501774, 32.33277817034873]` → `[35.016967571164145, 32.33891769233162]`; max 145.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 37

- Bounding coordinates: `[35.011279761000026, 32.295697947862614, 35.01571, 32.31403386805247]`.
- Maximum sampled deviation: **186.1 m** at `[35.01288580900007, 32.30270489600008]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.01189743501193, 32.295697947862614]` → `[35.014574228411746, 32.31403386805247]`; max 186.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.01302870336986, 32.296047184485396]` → `[35.0156806, 32.3118048]`; max 185.8 m.
  - Continuous portion 3, OSM to OCHA: `[35.0156806, 32.3118048]` → `[35.01563793814901, 32.314006464405146]`; max 140.2 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 38

- Bounding coordinates: `[35.0101679721738, 32.284211078693545, 35.01472456800008, 32.29203351330109]`.
- Maximum sampled deviation: **183.6 m** at `[35.01472456800008, 32.29075715100002]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.01107712272548, 32.284211078693545]` → `[35.01430036074587, 32.29201583506639]`; max 183.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.0101679721738, 32.2846865703301]` → `[35.013190145765456, 32.29203351330109]`; max 171.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 39

- Bounding coordinates: `[35.0089851, 32.279441799999994, 35.01935221063492, 32.28209622607774]`.
- Maximum sampled deviation: **228.0 m** at `[35.01291631300006, 32.28160941400006]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.01935221063492, 32.28059971054196]` → `[35.010601258928396, 32.28209622607774]`; max 228.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.01867563498095, 32.27984357555216]` → `[35.009435971126514, 32.28180114804031]`; max 214.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 40

- Bounding coordinates: `[35.020916053000064, 32.246783990010734, 35.0306328, 32.26844880538567]`.
- Maximum sampled deviation: **316.6 m** at `[35.028518, 32.26031869999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.021463119687084, 32.247001764454964]` → `[35.022842234717324, 32.255158091605836]`; max 284.2 m.
  - Continuous portion 2, OCHA to OSM: `[35.02303381602705, 32.255734874828455]` → `[35.02789901402797, 32.26823294033962]`; max 300.8 m.
  - Continuous portion 3, OSM to OCHA: `[35.0239033, 32.24866839999999]` → `[35.02384540975321, 32.25480523019154]`; max 277.2 m.
  - Continuous portion 4, OSM to OCHA: `[35.02419353942159, 32.25574857881123]` → `[35.02894396541769, 32.26844880538567]`; max 316.6 m.
  - Continuous portion 5, OSM to OCHA: `[35.0225383567022, 32.246783990010734]` → `[35.0239033, 32.24866839999999]`; max 238.9 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 41

- Bounding coordinates: `[35.0191643, 32.24121641658244, 35.02095214994267, 32.2434239999999]`.
- Maximum sampled deviation: **151.7 m** at `[35.019186, 32.2423204]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.02062971273569, 32.24133335302162]` → `[35.02095214994267, 32.24308270105384]`; max 145.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.01953301520328, 32.24121641658244]` → `[35.01992589432866, 32.2434239999999]`; max 151.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 42

- Bounding coordinates: `[35.011460818324295, 32.23338565276357, 35.0202103, 32.236687115000045]`.
- Maximum sampled deviation: **274.8 m** at `[35.0177529, 32.2335243]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.011460818324295, 32.234099063553074]` → `[35.01875025452901, 32.236067487701696]`; max 217.2 m.
  - Continuous portion 2, OSM to OCHA: `[35.01229647727376, 32.23338565276357]` → `[35.01981348089226, 32.235554524121255]`; max 274.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 43

- Bounding coordinates: `[34.95833169286539, 32.193386515270916, 35.00868911747546, 32.22898725970425]`.
- Maximum sampled deviation: **284.7 m** at `[34.96096181100006, 32.20108421100007]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.95833169286539, 32.19353590801566]` → `[34.970035686769755, 32.20177344870407]`; max 284.7 m.
  - Continuous portion 2, OCHA to OSM: `[34.97112402506782, 32.20176236943163]` → `[35.00788646107038, 32.22898725970425]`; max 258.3 m.
  - Continuous portion 3, OSM to OCHA: `[34.9797431, 32.2034148]` → `[34.9877537, 32.206919]`; max 232.8 m.
  - Continuous portion 4, OSM to OCHA: `[34.9877537, 32.206919]` → `[35.0072087, 32.2266072]`; max 244.5 m.
  - Continuous portion 5, OSM to OCHA: `[34.959378219834406, 32.193386515270916]` → `[34.96999496551145, 32.20082371929898]`; max 271.6 m.
  - Continuous portion 6, OSM to OCHA: `[34.971072408451015, 32.20082601180316]` → `[34.9797431, 32.2034148]`; max 268.7 m.
  - Continuous portion 7, OSM to OCHA: `[35.0072087, 32.2266072]` → `[35.00868911747546, 32.228394162457995]`; max 141.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 44

- Bounding coordinates: `[34.958751235106455, 32.16278155353246, 34.97430911784156, 32.18056246070277]`.
- Maximum sampled deviation: **443.3 m** at `[34.964224, 32.1689337]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.97430911784156, 32.1633429363082]` → `[34.96560374190149, 32.17336470368326]`; max 297.1 m.
  - Continuous portion 2, OSM to OCHA: `[34.97339966214198, 32.16278155353246]` → `[34.96454574917266, 32.17286316478264]`; max 443.3 m.
  - Continuous portion 3, OSM to OCHA: `[34.96315638863452, 32.173471238908434]` → `[34.958751235106455, 32.18027910182297]`; max 182.9 m.
  - Continuous portion 4, OCHA to OSM: `[34.96364949708288, 32.174322793658035]` → `[34.959775107074506, 32.18056246070277]`; max 179.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 45

- Bounding coordinates: `[34.97468763300003, 32.156599931895315, 34.9773437, 32.160476174273136]`.
- Maximum sampled deviation: **248.4 m** at `[34.97734014999185, 32.15810185000228]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.97537536001581, 32.156599931895315]` → `[34.97474977780997, 32.160183015642005]`; max 240.9 m.
  - Continuous portion 2, OSM to OCHA: `[34.97668079124998, 32.156634848858715]` → `[34.97581615831053, 32.160476174273136]`; max 248.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 46

- Bounding coordinates: `[34.9744174, 32.14853755676735, 34.98565531765842, 32.154240376148564]`.
- Maximum sampled deviation: **338.4 m** at `[34.9793852, 32.148735499999994]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98565531765842, 32.14942859547904]` → `[34.976129880925974, 32.15412426437274]`; max 315.1 m.
  - Continuous portion 2, OSM to OCHA: `[34.98504284764041, 32.14853755676735]` → `[34.97501044638721, 32.154240376148564]`; max 338.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 47

- Bounding coordinates: `[34.98744561173582, 32.14225561750581, 34.99006752787795, 32.14548239878646]`.
- Maximum sampled deviation: **116.0 m** at `[34.98750172300004, 32.14480923900005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98918826238684, 32.14225561750581]` → `[34.988319982201254, 32.1437569603037]`; max 108.1 m.
  - Continuous portion 2, OCHA to OSM: `[34.98826950336193, 32.14384860917314]` → `[34.98744561173582, 32.145194665586814]`; max 116.0 m.
  - Continuous portion 3, OSM to OCHA: `[34.99006752787795, 32.1427710181913]` → `[34.989296905075776, 32.144108426107955]`; max 107.5 m.
  - Continuous portion 4, OSM to OCHA: `[34.98919731998658, 32.144289235255236]` → `[34.98847174084253, 32.14548239878646]`; max 113.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 48

- Bounding coordinates: `[34.9867646, 32.1357231243167, 34.98971883030712, 32.13861159999999]`.
- Maximum sampled deviation: **217.8 m** at `[34.9875258, 32.13861159999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98859257655714, 32.13580461875388]` → `[34.98971883030712, 32.13784337188856]`; max 173.4 m.
  - Continuous portion 2, OSM to OCHA: `[34.98745500651305, 32.1357231243167]` → `[34.9876269, 32.137729799999995]`; max 207.4 m.
  - Continuous portion 3, OSM to OCHA: `[34.9876269, 32.137729799999995]` → `[34.9875258, 32.13861159999999]`; max 217.8 m.
  - Continuous portion 4, OSM to OCHA: `[34.9875258, 32.13861159999999]` → `[34.98878602550444, 32.13858773973346]`; max 217.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 49

- Bounding coordinates: `[34.98754051485413, 32.11859638805277, 34.98893683381117, 32.11988837605328]`.
- Maximum sampled deviation: **110.4 m** at `[34.98878680000001, 32.119456599999985]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98790617874407, 32.11859638805277]` → `[34.98754051485413, 32.119490531374694]`; max 109.3 m.
  - Continuous portion 2, OSM to OCHA: `[34.9886263, 32.1197282]` → `[34.988501769186925, 32.11988837605328]`; max 105.6 m.
  - Continuous portion 3, OSM to OCHA: `[34.98893683381117, 32.118843661353544]` → `[34.9886263, 32.1197282]`; max 110.4 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 50

- Bounding coordinates: `[34.99093007308156, 32.10609787545542, 34.9938509, 32.113371300000004]`.
- Maximum sampled deviation: **163.7 m** at `[34.9928023, 32.1125912]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.99180670174056, 32.10658560526358]` → `[34.99241952918009, 32.10990579306623]`; max 137.6 m.
  - Continuous portion 2, OCHA to OSM: `[34.992277588682356, 32.110405248423135]` → `[34.99093007308156, 32.112575726716194]`; max 160.8 m.
  - Continuous portion 3, OSM to OCHA: `[34.99322, 32.1064223]` → `[34.9935901, 32.1072909]`; max 138.1 m.
  - Continuous portion 4, OSM to OCHA: `[34.9935901, 32.1072909]` → `[34.993493575762535, 32.109988689804666]`; max 142.6 m.
  - Continuous portion 5, OSM to OCHA: `[34.99327365015665, 32.1107483629494]` → `[34.99178425346149, 32.113174932591384]`; max 163.7 m.
  - Continuous portion 6, OSM to OCHA: `[34.99272401059597, 32.10609787545542]` → `[34.99322, 32.1064223]`; max 131.3 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 51

- Bounding coordinates: `[34.990765741580034, 32.102255212548975, 34.9910617, 32.10255959430688]`.
- Maximum sampled deviation: **116.7 m** at `[34.9910617, 32.10236170000001]`.
- Directions: OSM to OCHA.
  - Continuous portion 1, OSM to OCHA: `[34.990765741580034, 32.102255212548975]` → `[34.991003001772526, 32.10255959430688]`; max 116.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 52

- Bounding coordinates: `[34.9861573, 32.099483380928326, 34.98819642134937, 32.101106196590216]`.
- Maximum sampled deviation: **153.8 m** at `[34.9861573, 32.100306499999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.987476348315624, 32.099483380928326]` → `[34.98819642134937, 32.10049125756691]`; max 128.5 m.
  - Continuous portion 2, OSM to OCHA: `[34.986383806544744, 32.09968965085427]` → `[34.98739583646166, 32.101106196590216]`; max 153.8 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 53

- Bounding coordinates: `[34.984947608207726, 32.08615781669369, 34.9874566345324, 32.08978299999999]`.
- Maximum sampled deviation: **213.0 m** at `[34.9863064, 32.08978299999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98647634673995, 32.08615781669369]` → `[34.984947608207726, 32.08816223234135]`; max 156.1 m.
  - Continuous portion 2, OSM to OCHA: `[34.9874566345324, 32.086525287794984]` → `[34.985301204175684, 32.08921911310761]`; max 213.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 54

- Bounding coordinates: `[34.98946788468846, 32.0475267918479, 35.002074409000045, 32.08064110310218]`.
- Maximum sampled deviation: **273.6 m** at `[34.9912638, 32.074509]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.00197749115161, 32.04757592742684]` → `[34.99043539183724, 32.08064110310218]`; max 273.5 m.
  - Continuous portion 2, OSM to OCHA: `[34.99961600000001, 32.0518565]` → `[34.99526350000001, 32.063657500000005]`; max 190.6 m.
  - Continuous portion 3, OSM to OCHA: `[34.99526350000001, 32.063657500000005]` → `[34.9912371, 32.0746535]`; max 273.6 m.
  - Continuous portion 4, OSM to OCHA: `[34.9912371, 32.0746535]` → `[34.98946788468846, 32.08023383801537]`; max 271.4 m.
  - Continuous portion 5, OSM to OCHA: `[35.00090072780392, 32.0475267918479]` → `[34.99961600000001, 32.0518565]`; max 173.9 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 55

- Bounding coordinates: `[35.002368155000056, 32.03560648633382, 35.00351867794379, 32.0365123823448]`.
- Maximum sampled deviation: **103.5 m** at `[35.002368155000056, 32.03624568700006]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.00246553295109, 32.03560648633382]` → `[35.002381213243844, 32.03649604806308]`; max 103.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.00351867794379, 32.03570084991488]` → `[35.00344176384297, 32.0365123823448]`; max 103.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 56

- Bounding coordinates: `[34.992777595000064, 32.000011846775415, 35.0051949, 32.033666837898245]`.
- Maximum sampled deviation: **648.7 m** at `[34.992777595000064, 32.014604708000036]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.99820476201684, 32.000011846775415]` → `[35.00265207130335, 32.033638487792224]`; max 648.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.0038508, 32.0199891]` → `[35.00371144996879, 32.033666837898245]`; max 391.9 m.
  - Continuous portion 3, OSM to OCHA: `[34.99925486196039, 32.00027293896001]` → `[35.0038508, 32.0199891]`; max 648.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 57

- Bounding coordinates: `[34.995902042966456, 31.97940895177167, 34.999106425000036, 31.987825747049577]`.
- Maximum sampled deviation: **182.2 m** at `[34.99899960100004, 31.983615698000047]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.999021174431356, 31.98776599890224]` → `[34.99692603738989, 31.97940895177167]`; max 182.2 m.
  - Continuous portion 2, OSM to OCHA: `[34.995902042966456, 31.97965075652205]` → `[34.99795891072037, 31.987825747049577]`; max 178.9 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 58

- Bounding coordinates: `[34.99227603354384, 31.97231802029255, 34.99436001420667, 31.9741455231329]`.
- Maximum sampled deviation: **147.0 m** at `[34.9940685, 31.972783399999994]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.99340222849878, 31.9741455231329]` → `[34.99227603354384, 31.97305162774632]`; max 133.6 m.
  - Continuous portion 2, OSM to OCHA: `[34.99292830576446, 31.97231802029255]` → `[34.99436001420667, 31.97370865586891]`; max 147.0 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 59

- Bounding coordinates: `[34.9868387, 31.969558675906008, 34.98850420570436, 31.97081355520422]`.
- Maximum sampled deviation: **168.8 m** at `[34.9868387, 31.970600099999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98850420570436, 31.969926146885378]` → `[34.988183041775095, 31.969558675906008]`; max 117.9 m.
  - Continuous portion 2, OSM to OCHA: `[34.98705930970456, 31.96972432670668]` → `[34.98806910435947, 31.97081355520422]`; max 168.8 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 60

- Bounding coordinates: `[34.98815741434598, 31.94688040974345, 35.00683988493646, 31.996864648911505]`.
- Maximum sampled deviation: **739.5 m** at `[35.004401434000044, 31.981092262000058]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.00683988493646, 31.947198101763004]` → `[35.00045627786208, 31.996864648911505]`; max 739.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.005785659873425, 31.94688040974345]` → `[34.98815741434598, 31.967697320140118]`; max 433.8 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 61

- Bounding coordinates: `[35.00617363787514, 31.94240306734136, 35.0087895, 31.94476901067864]`.
- Maximum sampled deviation: **223.1 m** at `[35.0087895, 31.9436488]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.00617363787514, 31.94288554318104]` → `[35.00660654539857, 31.944545490798426]`; max 161.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.00713121858983, 31.94240306734136]` → `[35.00774827407495, 31.94476901067864]`; max 223.1 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 62

- Bounding coordinates: `[34.98066310000001, 31.920838905133838, 35.0133963222644, 31.967559900023886]`.
- Maximum sampled deviation: **614.0 m** at `[34.9925972, 31.9397529]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98695666184054, 31.96635707725819]` → `[35.0133963222644, 31.9216374787038]`; max 578.9 m.
  - Continuous portion 2, OSM to OCHA: `[34.98593770117426, 31.966772490832184]` → `[35.012893183414896, 31.920838905133838]`; max 614.0 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 63

- Bounding coordinates: `[35.0023435, 31.862403397586657, 35.04212645100006, 31.94069732356404]`.
- Maximum sampled deviation: **517.3 m** at `[35.04040596200008, 31.91935838300004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.03594044913071, 31.862403397586657]` → `[35.00600772680864, 31.940357188908635]`; max 517.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.03495851225569, 31.86276041981888]` → `[35.0361929, 31.867233299999988]`; max 224.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.0388726, 31.902803799999997]` → `[35.0361929, 31.867233299999988]`; max 360.7 m.
  - Continuous portion 4, OSM to OCHA: `[35.0388726, 31.902803799999997]` → `[35.00486070780278, 31.94069732356404]`; max 508.0 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 64

- Bounding coordinates: `[35.021542088832966, 31.877474985371787, 35.02988841800004, 31.916713009268317]`.
- Maximum sampled deviation: **638.4 m** at `[35.022397, 31.8857478]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.02248862798063, 31.916713009268317]` → `[35.0267921851848, 31.877474985371787]`; max 537.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.021542088832966, 31.916164416695572]` → `[35.0257327628966, 31.877758638385952]`; max 638.4 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 65

- Bounding coordinates: `[35.01769769576507, 31.8698868023529, 35.0257818, 31.874953633731508]`.
- Maximum sampled deviation: **427.3 m** at `[35.0253148, 31.86993979999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.024701375845, 31.874953633731508]` → `[35.01769769576507, 31.870787806043275]`; max 322.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.02576077014671, 31.874669990399575]` → `[35.017813544313604, 31.8698868023529]`; max 427.3 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 66

- Bounding coordinates: `[34.98455613141353, 31.867136129636872, 34.98769340516574, 31.8687383965028]`.
- Maximum sampled deviation: **103.2 m** at `[34.987059068000065, 31.868672004000075]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.98743256036387, 31.8687383965028]` → `[34.98455613141353, 31.867997843541072]`; max 103.2 m.
  - Continuous portion 2, OSM to OCHA: `[34.98769340516574, 31.867863601365137]` → `[34.984867790326355, 31.867136129636872]`; max 103.0 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 67

- Bounding coordinates: `[35.066428443866066, 31.852999323036133, 35.082337229209216, 31.857614963000053]`.
- Maximum sampled deviation: **146.9 m** at `[35.08061066000005, 31.854931300000036]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.082337229209216, 31.853767971798966]` → `[35.06960202559809, 31.857367490451207]`; max 146.9 m.
  - Continuous portion 2, OCHA to OSM: `[35.068496022580526, 31.857461993816656]` → `[35.066428443866066, 31.857556543598022]`; max 108.0 m.
  - Continuous portion 3, OSM to OCHA: `[35.0817728957976, 31.852999323036133]` → `[35.069467044902794, 31.856472741181072]`; max 145.9 m.
  - Continuous portion 4, OSM to OCHA: `[35.068421672296445, 31.85656206350474]` → `[35.066526398186774, 31.85664831304334]`; max 107.2 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 68

- Bounding coordinates: `[35.00009460141896, 31.854494598397814, 35.01267566426062, 31.857073489696212]`.
- Maximum sampled deviation: **139.6 m** at `[35.00531694500006, 31.856728059000037]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.00009460141896, 31.85529179250689]` → `[35.01257868261202, 31.857073489696212]`; max 139.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.00061724974059, 31.854494598397814]` → `[35.01267566426062, 31.856172946097345]`; max 138.7 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 69

- Bounding coordinates: `[34.99351997867444, 31.849236210910465, 34.99685373315231, 31.8531392443775]`.
- Maximum sampled deviation: **152.6 m** at `[34.9945893, 31.851984900000005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.994466501997564, 31.849236210910465]` → `[34.99685373315231, 31.852380239307873]`; max 152.0 m.
  - Continuous portion 2, OSM to OCHA: `[34.99351997867444, 31.849660678872002]` → `[34.99621497065089, 31.8531392443775]`; max 152.6 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 70

- Bounding coordinates: `[35.04521896922985, 31.84769797188205, 35.051268457084475, 31.85213582032641]`.
- Maximum sampled deviation: **159.7 m** at `[35.0469346, 31.85022970000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.051268457084475, 31.85139763942983]` → `[35.04597529268616, 31.84769797188205]`; max 155.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.05065700725969, 31.85213582032641]` → `[35.04521896922985, 31.84833487562105]`; max 159.7 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 71

- Bounding coordinates: `[34.9775764, 31.8303744, 34.99312034802541, 31.839595863208118]`.
- Maximum sampled deviation: **690.1 m** at `[34.977965, 31.832387600000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.99312034802541, 31.831296358921055]` → `[34.98253576986725, 31.839102174044104]`; max 530.3 m.
  - Continuous portion 2, OSM to OCHA: `[34.992819630009215, 31.830406523298684]` → `[34.98156241368957, 31.839595863208118]`; max 690.1 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 72

- Bounding coordinates: `[35.04806287708666, 31.809955509579083, 35.159181187685405, 31.85134529999999]`.
- Maximum sampled deviation: **625.1 m** at `[35.1071809, 31.823854799999992]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.107886826000026, 31.829809349000072]` → `[35.0904536047917, 31.84585652577465]`; max 403.6 m.
  - Continuous portion 2, OCHA to OSM: `[35.10455257424921, 31.83040433583607]` → `[35.107886826000026, 31.829809349000072]`; max 403.6 m.
  - Continuous portion 3, OCHA to OSM: `[35.107886826000026, 31.829809349000072]` → `[35.159181187685405, 31.810829643660526]`; max 594.4 m.
  - Continuous portion 4, OSM to OCHA: `[35.15890740560508, 31.809955509579083]` → `[35.1483688, 31.81199109999999]`; max 250.1 m.
  - Continuous portion 5, OSM to OCHA: `[35.1483688, 31.81199109999999]` → `[35.128811000000006, 31.8203221]`; max 422.6 m.
  - Continuous portion 6, OSM to OCHA: `[35.105288200000004, 31.825127900000005]` → `[35.103612910785884, 31.829650751533272]`; max 558.5 m.
  - Continuous portion 7, OSM to OCHA: `[35.10322993267847, 31.831860135591498]` → `[35.10198346197189, 31.832673921615637]`; max 157.8 m.
  - Continuous portion 8, OCHA to OSM: `[35.101725592431876, 31.831707055314673]` → `[35.10224896065019, 31.83136536436625]`; max 119.8 m.
  - Continuous portion 9, OSM to OCHA: `[35.09403789566877, 31.837766905392623]` → `[35.08954598558169, 31.84537446057533]`; max 261.6 m.
  - Continuous portion 10, OCHA to OSM: `[35.06223268965256, 31.84967773626493]` → `[35.093242145932834, 31.83714849520526]`; max 560.1 m.
  - Continuous portion 11, OSM to OCHA: `[35.128811000000006, 31.8203221]` → `[35.1230755, 31.824259400000006]`; max 303.7 m.
  - Continuous portion 12, OSM to OCHA: `[35.1230755, 31.824259400000006]` → `[35.105288200000004, 31.825127900000005]`; max 625.1 m.
  - Continuous portion 13, OSM to OCHA: `[35.04806287708666, 31.83101655684223]` → `[35.06074158524364, 31.849418633261443]`; max 485.9 m.
  - Continuous portion 14, OCHA to OSM: `[35.04889271649551, 31.830455782805018]` → `[35.06105541542947, 31.848180048244984]`; max 449.7 m.
  - Continuous portion 15, OSM to OCHA: `[35.062513513253236, 31.848435043404155]` → `[35.105288200000004, 31.825127900000005]`; max 618.2 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 73

- Bounding coordinates: `[35.00877399250533, 31.82847159999999, 35.03335409377781, 31.837165536676984]`.
- Maximum sampled deviation: **281.1 m** at `[35.0161731, 31.82847159999999]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.03264149426657, 31.837165536676984]` → `[35.00877399250533, 31.830110235082476]`; max 277.2 m.
  - Continuous portion 2, OSM to OCHA: `[35.03335409377781, 31.83648700842274]` → `[35.008797630728516, 31.829201449147526]`; max 281.1 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 74

- Bounding coordinates: `[34.9553582, 31.815870299999997, 35.03983096540424, 31.863466125224857]`.
- Maximum sampled deviation: **737.9 m** at `[34.972357, 31.8177484]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.96906705340638, 31.862655953796537]` → `[35.03912320020188, 31.822862357809985]`; max 736.6 m.
  - Continuous portion 2, OSM to OCHA: `[34.96856531441861, 31.863466125224857]` → `[35.03983096540424, 31.822180220376694]`; max 737.9 m.
- Interpretation / depiction decision: Latrun/Modiin corridor: different treatment and generalization of paired edges. OCHA and OSM enclose different polygons; preserve the OSM closed paired-line ring rather than snapping or averaging the edges. The eastern closure was never defined on an agreed map; this is the OSM cartographic closure, not a survey-level rectification.


## Judea and Samaria · 75

- Bounding coordinates: `[35.18923082259371, 31.801944764636485, 35.22284784193861, 31.81151384000003]`.
- Maximum sampled deviation: **455.2 m** at `[35.2098431, 31.805240800000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.18923082259371, 31.810324428270476]` → `[35.22284784193861, 31.802662057767517]`; max 440.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.22220651645324, 31.801944764636485]` → `[35.18951169891117, 31.80942748124898]`; max 455.2 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 76

- Bounding coordinates: `[35.2237533, 31.79363664856057, 35.22582543239455, 31.800525422150667]`.
- Maximum sampled deviation: **206.0 m** at `[35.2237533, 31.796329599999996]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.22489053140563, 31.800525422150667]` → `[35.22582543239455, 31.796985928005217]`; max 153.9 m.
  - Continuous portion 2, OSM to OCHA: `[35.22516683756022, 31.79363664856057]` → `[35.224889359841264, 31.796335794511577]`; max 206.0 m.
  - Continuous portion 3, OSM to OCHA: `[35.22484440672906, 31.796549759199]` → `[35.22387047458139, 31.800218386014077]`; max 154.0 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 77

- Bounding coordinates: `[35.2374352, 31.784724000000004, 35.251211, 31.801609000000003]`.
- Maximum sampled deviation: **2370.5 m** at `[35.2511469, 31.784829999999992]`.
- Directions: OSM to OCHA.
  - Continuous portion 1, OSM to OCHA: `[35.2476276, 31.789395]` → `[35.2476276, 31.789395]`; max 2370.5 m.
- Interpretation / depiction decision: Mount Scopus enclave loop is present in OSM and missing from this OCHA line extract. The large nearest-line distance measures an omitted feature, not the loop being 2 km out of place. Keep only the northern OSM arc as a partial outline, excluding Augusta Victoria; its internal division is not mapped. Do not hatch it as no-man’s-land.


## Judea and Samaria · 78

- Bounding coordinates: `[35.225818739716814, 31.7796298, 35.2303836, 31.791511384085833]`.
- Maximum sampled deviation: **425.0 m** at `[35.2303836, 31.7816464]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.226134907160585, 31.785592562479742]` → `[35.22605401946834, 31.78428183984306]`; max 119.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.22707765918333, 31.783739356348224]` → `[35.227196600655994, 31.78566636924238]`; max 127.4 m.
  - Continuous portion 3, OSM to OCHA: `[35.22701895123983, 31.77969444001712]` → `[35.22725960328333, 31.78668704792162]`; max 425.0 m.
  - Continuous portion 4, OCHA to OSM: `[35.22585272551948, 31.781019782927082]` → `[35.225818739716814, 31.780468993733937]`; max 121.5 m.
  - Continuous portion 5, OSM to OCHA: `[35.22693336336304, 31.780032113024816]` → `[35.22692805885942, 31.781315456168198]`; max 165.1 m.
  - Continuous portion 6, OSM to OCHA: `[35.227314339961815, 31.787573785840557]` → `[35.227298478743435, 31.791511384085833]`; max 237.2 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 79

- Bounding coordinates: `[35.2254432, 31.776576523534693, 35.22562678202864, 31.777143810729516]`.
- Maximum sampled deviation: **111.0 m** at `[35.225469000000004, 31.7768178]`.
- Directions: OSM to OCHA.
  - Continuous portion 1, OSM to OCHA: `[35.22562678202864, 31.776576523534693]` → `[35.2255053547514, 31.777143810729516]`; max 111.0 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 80

- Bounding coordinates: `[35.214379205158316, 31.7338671, 35.2431085, 31.772980765609482]`.
- Maximum sampled deviation: **1447.0 m** at `[35.2431085, 31.7512025]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.22679236847703, 31.772235488784283]` → `[35.227103931573225, 31.758230158161105]`; max 282.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.224582565468985, 31.744579872263483]` → `[35.226201970214774, 31.75726436001295]`; max 328.0 m.
  - Continuous portion 3, OCHA to OSM: `[35.227549887706274, 31.7555040363042]` → `[35.226113187360404, 31.74551427443493]`; max 330.9 m.
  - Continuous portion 4, OSM to OCHA: `[35.2275556, 31.744608400000004]` → `[35.2268465260705, 31.744610440410593]`; max 163.1 m.
  - Continuous portion 5, OCHA to OSM: `[35.225331964599256, 31.74371305705645]` → `[35.2152139493822, 31.738457883687804]`; max 438.1 m.
  - Continuous portion 6, OSM to OCHA: `[35.214379205158316, 31.73788969969115]` → `[35.2275556, 31.744608400000004]`; max 508.1 m.
  - Continuous portion 7, OSM to OCHA: `[35.228171265063644, 31.758225133854953]` → `[35.229721, 31.772613599999996]`; max 304.6 m.
  - Continuous portion 8, OSM to OCHA: `[35.229721, 31.772613599999996]` → `[35.22783529201604, 31.77274357515651]`; max 278.3 m.
  - Continuous portion 9, OSM to OCHA: `[35.2275556, 31.744608400000004]` → `[35.22782929689715, 31.772980765609482]`; max 1447.0 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 81

- Bounding coordinates: `[35.19544127747378, 31.748971252029143, 35.19728577988768, 31.750409000000005]`.
- Maximum sampled deviation: **153.8 m** at `[35.1963962, 31.750409000000005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.19678710977538, 31.749059954272468]` → `[35.19609093695684, 31.748971252029143]`; max 125.9 m.
  - Continuous portion 2, OSM to OCHA: `[35.19544127747378, 31.749813423384882]` → `[35.19728577988768, 31.750051648326398]`; max 153.8 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 82

- Bounding coordinates: `[35.19816111090387, 31.746674200000005, 35.20850036547963, 31.750617304000052]`.
- Maximum sampled deviation: **416.0 m** at `[35.202467949884905, 31.74673870062908]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.20850036547963, 31.74932294768173]` → `[35.198847280009204, 31.74945662794267]`; max 369.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.19816111090387, 31.748352920666775]` → `[35.20809252534054, 31.748439779817414]`; max 416.0 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 83

- Bounding coordinates: `[35.18920989412065, 31.746092, 35.19433625687704, 31.748715526690553]`.
- Maximum sampled deviation: **240.3 m** at `[35.1924388, 31.746374799999998]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.19356993509752, 31.748715526690553]` → `[35.18929053076699, 31.747571427212325]`; max 239.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.18920989412065, 31.746554442600136]` → `[35.19433625687704, 31.7478851979493]`; max 240.3 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 84

- Bounding coordinates: `[35.18604619762664, 31.74655261427945, 35.18682491035262, 31.7476745]`.
- Maximum sampled deviation: **120.7 m** at `[35.1864244, 31.7476745]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.18682491035262, 31.746635042245533]` → `[35.18660799747993, 31.74655261427945]`; max 104.7 m.
  - Continuous portion 2, OSM to OCHA: `[35.18604619762664, 31.74733448263943]` → `[35.18674958750906, 31.74759330086059]`; max 120.7 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 85

- Bounding coordinates: `[35.163543175672835, 31.741400800000008, 35.18330704128847, 31.745514208488242]`.
- Maximum sampled deviation: **385.5 m** at `[35.1748466, 31.7415575]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.182480480514556, 31.745514208488242]` → `[35.1637835207158, 31.7431901930233]`; max 380.6 m.
  - Continuous portion 2, OSM to OCHA: `[35.163543175672835, 31.742203321237454]` → `[35.18330704128847, 31.744779845022887]`; max 385.5 m.
- Interpretation / depiction decision: Jerusalem paired-line / no-man’s-land sector, including the Government House–Ramat Rachel–Beit Safafa area in the south. UN map 229 distinguishes Israeli and Jordanian lines. Replace the central OSM pair with the seven-control UN229 digitization; retain the Abu Tor gap and north pair through map coverage. Government House is a separate civilian-use/demilitarized zone clipped at grid northings128/130, not no-man’s-land. Do not attribute the residual to a particular later agreement without its map.


## Judea and Samaria · 86

- Bounding coordinates: `[35.15644570425159, 31.7412631960125, 35.16192874927995, 31.745024099999995]`.
- Maximum sampled deviation: **301.5 m** at `[35.1584372, 31.74458920000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.16146824140222, 31.742667821106565]` → `[35.15721402352589, 31.7412631960125]`; max 262.8 m.
  - Continuous portion 2, OSM to OCHA: `[35.15644570425159, 31.741975052306348]` → `[35.16192874927995, 31.743704376254385]`; max 301.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 87

- Bounding coordinates: `[35.15076824920312, 31.736690620883408, 35.15460921328368, 31.739573012277802]`.
- Maximum sampled deviation: **168.6 m** at `[35.1530018, 31.7370593]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.15378762844918, 31.739573012277802]` → `[35.15076824920312, 31.737563482212533]`; max 164.8 m.
  - Continuous portion 2, OSM to OCHA: `[35.15115405431693, 31.736690620883408]` → `[35.15460921328368, 31.738984953431213]`; max 168.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 88

- Bounding coordinates: `[35.133337280907625, 31.728729299999998, 35.14571819096294, 31.734455700000005]`.
- Maximum sampled deviation: **466.6 m** at `[35.1396843, 31.728844000000002]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.145138450262486, 31.73434157168296]` → `[35.13741765489345, 31.732735489354575]`; max 379.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.1364134, 31.7337553]` → `[35.13640156140184, 31.733551741044774]`; max 122.2 m.
  - Continuous portion 3, OCHA to OSM: `[35.135310895105995, 31.732844222106017]` → `[35.13368306995537, 31.733113969605043]`; max 155.7 m.
  - Continuous portion 4, OSM to OCHA: `[35.136385912142394, 31.7317029055703]` → `[35.14571819096294, 31.733548144717567]`; max 466.6 m.
  - Continuous portion 5, OSM to OCHA: `[35.133337280907625, 31.733981093224955]` → `[35.1364134, 31.7337553]`; max 171.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 89

- Bounding coordinates: `[35.11313937602422, 31.713716499999993, 35.12273598263309, 31.72345650340202]`.
- Maximum sampled deviation: **395.0 m** at `[35.1205184, 31.715567600000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.121853102337724, 31.72345650340202]` → `[35.11313937602422, 31.715067448524387]`; max 383.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.11320362185279, 31.71413017307132]` → `[35.1164331, 31.713716499999993]`; max 249.2 m.
  - Continuous portion 3, OSM to OCHA: `[35.1164331, 31.713716499999993]` → `[35.12273598263309, 31.72295117143481]`; max 395.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 90

- Bounding coordinates: `[35.10426061844831, 31.71211420145949, 35.10972995026222, 31.71528639999999]`.
- Maximum sampled deviation: **212.0 m** at `[35.1067712, 31.715000899999993]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.10972995026222, 31.71403443415803]` → `[35.10491844850543, 31.71211420145949]`; max 211.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.10426061844831, 31.712844165612765]` → `[35.10970353600638, 31.7149831830475]`; max 212.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 91

- Bounding coordinates: `[35.07956544035487, 31.6886413819796, 35.0853144, 31.693241559188742]`.
- Maximum sampled deviation: **313.7 m** at `[35.0852791, 31.690610600000003]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.08359492381528, 31.693241559188742]` → `[35.07956544035487, 31.689378740313405]`; max 248.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.08021785788496, 31.6886413819796]` → `[35.08464883248003, 31.69289575825108]`; max 313.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 92

- Bounding coordinates: `[35.06077398849622, 31.677393182792805, 35.0763075764573, 31.686791863183956]`.
- Maximum sampled deviation: **197.7 m** at `[35.06656, 31.6824973]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.0763075764573, 31.68607456924299]` → `[35.061339001212005, 31.677393182792805]`; max 197.4 m.
  - Continuous portion 2, OSM to OCHA: `[35.06077398849622, 31.67815624707202]` → `[35.075635380371864, 31.686791863183956]`; max 197.7 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 93

- Bounding coordinates: `[35.01068907862815, 31.654367966164532, 35.04633944072384, 31.670284250751298]`.
- Maximum sampled deviation: **414.3 m** at `[35.0284754, 31.659496299999994]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.0458601655938, 31.670284250751298]` → `[35.01068907862815, 31.655206821840938]`; max 414.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.0111593349814, 31.654367966164532]` → `[35.04633944072384, 31.66946883442014]`; max 414.3 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 94

- Bounding coordinates: `[34.945948791989224, 31.572417157860468, 34.96088258743704, 31.602127373175787]`.
- Maximum sampled deviation: **323.9 m** at `[34.9523937, 31.594663399999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.96088258743704, 31.601607199390454]` → `[34.94699662717265, 31.572417157860468]`; max 320.5 m.
  - Continuous portion 2, OSM to OCHA: `[34.945948791989224, 31.57256212502539]` → `[34.960006839257254, 31.602127373175787]`; max 323.9 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 95

- Bounding coordinates: `[34.9403675, 31.49970122204813, 34.94834962600004, 31.566518938422625]`.
- Maximum sampled deviation: **562.4 m** at `[34.94762100000003, 31.535765716000064]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.94643779381985, 31.566518938422625]` → `[34.94336256193914, 31.49970122204813]`; max 562.4 m.
  - Continuous portion 2, OSM to OCHA: `[34.94234533330768, 31.49995399841441]` → `[34.94538329017063, 31.566507130395514]`; max 556.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 96

- Bounding coordinates: `[35.42796465440832, 31.4962799, 35.4432527064469, 31.49766776100006]`.
- Maximum sampled deviation: **147.3 m** at `[35.43458279300006, 31.49766776100006]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.42796465440832, 31.4971946783132]` → `[35.4432527064469, 31.497385685281365]`; max 147.3 m.
  - Continuous portion 2, OSM to OCHA: `[35.443244454445, 31.49648364939493]` → `[35.42800582237871, 31.49629282660965]`; max 147.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 97

- Bounding coordinates: `[35.45512325015241, 31.493119999999998, 35.476012000000004, 31.49728910445832]`.
- Maximum sampled deviation: **242.5 m** at `[35.476012000000004, 31.493119999999998]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.4551749664307, 31.49728910445832]` → `[35.47531014300006, 31.495222500000065]`; max 233.5 m.
  - Continuous portion 2, OSM to OCHA: `[35.476012000000004, 31.493119999999998]` → `[35.45512325015241, 31.496387746733117]`; max 242.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 98

- Bounding coordinates: `[35.398440978356454, 31.491891599999995, 35.410551616098786, 31.496072376256702]`.
- Maximum sampled deviation: **176.2 m** at `[35.40339639300004, 31.494913542000067]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.398805253900925, 31.49313284745179]` → `[35.41037644335344, 31.496072376256702]`; max 176.2 m.
  - Continuous portion 2, OSM to OCHA: `[35.410551616098786, 31.495174705957936]` → `[35.398440978356454, 31.492001796143445]`; max 175.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 99

- Bounding coordinates: `[34.93913780699225, 31.490966162216328, 34.94028610568749, 31.49163535776974]`.
- Maximum sampled deviation: **101.0 m** at `[34.94020491500004, 31.49112757500006]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.94028610568749, 31.49138678266865]` → `[34.940136320398764, 31.490966162216328]`; max 101.0 m.
  - Continuous portion 2, OSM to OCHA: `[34.93913780699225, 31.491252268058346]` → `[34.939274223352, 31.49163535776974]`; max 100.9 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 100

- Bounding coordinates: `[34.93182584460488, 31.476016308478002, 34.935472991506145, 31.48140281283406]`.
- Maximum sampled deviation: **105.1 m** at `[34.93317797000003, 31.476660187000046]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.935472991506145, 31.481017996867394]` → `[34.932772434939345, 31.476016308478002]`; max 105.1 m.
  - Continuous portion 2, OSM to OCHA: `[34.93182584460488, 31.476412056122157]` → `[34.93452105561929, 31.48140281283406]`; max 105.0 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 101

- Bounding coordinates: `[35.245457096205875, 31.388318420515102, 35.39563474786879, 31.491406120233815]`.
- Maximum sampled deviation: **614.5 m** at `[35.2879513, 31.4166259]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[35.245457096205875, 31.388904399126538]` → `[35.395052687046366, 31.491406120233815]`; max 614.0 m.
  - Continuous portion 2, OSM to OCHA: `[35.39563474786879, 31.490654006309647]` → `[35.3952076, 31.490388599999996]`; max 104.2 m.
  - Continuous portion 3, OSM to OCHA: `[35.3952076, 31.490388599999996]` → `[35.3558046, 31.4630977]`; max 315.3 m.
  - Continuous portion 4, OSM to OCHA: `[35.3558046, 31.4630977]` → `[35.2462613208543, 31.388318420515102]`; max 614.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 102

- Bounding coordinates: `[34.89608272879674, 31.43004734352979, 34.902814049228176, 31.439023188727322]`.
- Maximum sampled deviation: **171.6 m** at `[34.8998166, 31.4371041]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.902814049228176, 31.438458764489535]` → `[34.89703680207391, 31.43004734352979]`; max 171.1 m.
  - Continuous portion 2, OSM to OCHA: `[34.9005102, 31.43782540000001]` → `[34.901979545072415, 31.439023188727322]`; max 154.5 m.
  - Continuous portion 3, OSM to OCHA: `[34.89608272879674, 31.430436853199318]` → `[34.9005102, 31.43782540000001]`; max 171.6 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 103

- Bounding coordinates: `[34.8800552, 31.357241783488092, 34.90896955373226, 31.400245171778955]`.
- Maximum sampled deviation: **401.5 m** at `[34.8800552, 31.392329300000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.883638295781445, 31.40010680158707]` → `[34.90896955373226, 31.357942242369074]`; max 374.2 m.
  - Continuous portion 2, OSM to OCHA: `[34.90827822778117, 31.357241783488092]` → `[34.88259026536892, 31.400245171778955]`; max 401.5 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Judea and Samaria · 104

- Bounding coordinates: `[34.9099183, 31.342106799999993, 35.24273008468396, 31.385926454845094]`.
- Maximum sampled deviation: **842.1 m** at `[34.9246515, 31.342106799999993]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.911333338931186, 31.355438761974536]` → `[35.242034864011764, 31.385926454845094]`; max 820.1 m.
  - Continuous portion 2, OSM to OCHA: `[35.2304749, 31.3747671]` → `[35.1105746, 31.3567764]`; max 513.3 m.
  - Continuous portion 3, OSM to OCHA: `[35.1105746, 31.3567764]` → `[35.0239793, 31.35917759999999]`; max 628.0 m.
  - Continuous portion 4, OSM to OCHA: `[35.0239793, 31.35917759999999]` → `[34.9503931, 31.348064300000008]`; max 677.7 m.
  - Continuous portion 5, OSM to OCHA: `[34.9176229, 31.344923000000005]` → `[34.910410969417214, 31.354983022059837]`; max 648.0 m.
  - Continuous portion 6, OSM to OCHA: `[34.9503931, 31.348064300000008]` → `[34.9329895, 31.3433952]`; max 676.2 m.
  - Continuous portion 7, OSM to OCHA: `[34.9329895, 31.3433952]` → `[34.9176229, 31.344923000000005]`; max 842.1 m.
  - Continuous portion 8, OSM to OCHA: `[35.24273008468396, 31.3852445503081]` → `[35.2304749, 31.3747671]`; max 339.1 m.
- Interpretation / depiction decision: Ordinary alignment/generalization mismatch: the products have different vertex density and local bends. No inspected evidence identifies this as a separate legal adjustment. Choose the retained detailed OSM cartographic alignment consistently; do not invent a historical explanation or interpolate between sources. The retained UNTS42 north sheet (1:250,000) is not a detailed positional tie-breaker; the southern sheet is missing.


## Gaza Strip · 1

- Bounding coordinates: `[34.488477088000025, 31.595745950597315, 34.490451747125924, 31.597524500000077]`.
- Maximum sampled deviation: **370.7 m** at `[34.488477088000025, 31.597524500000077]`.
- Directions: OCHA to OSM.
  - Continuous portion 1, OCHA to OSM: `[34.490451747125924, 31.595745950597315]` → `[34.488477088000025, 31.597524500000077]`; max 370.7 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 2

- Bounding coordinates: `[34.497293877314746, 31.586104624805262, 34.502973861461, 31.590245577165426]`.
- Maximum sampled deviation: **140.7 m** at `[34.499574471000074, 31.58752798500007]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.50238716122833, 31.586104624805262]` → `[34.497293877314746, 31.589582590225316]`; max 140.7 m.
  - Continuous portion 2, OSM to OCHA: `[34.502973861461, 31.58685556773951]` → `[34.498011547919695, 31.590245577165426]`; max 138.9 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 3

- Bounding coordinates: `[34.54975908097442, 31.548480670369937, 34.555347366321705, 31.553104639833748]`.
- Maximum sampled deviation: **119.4 m** at `[34.5525745, 31.551533799999998]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.554630217991416, 31.548480670369937]` → `[34.54975908097442, 31.55241692136266]`; max 119.3 m.
  - Continuous portion 2, OSM to OCHA: `[34.555347366321705, 31.549142331049307]` → `[34.550445451644975, 31.553104639833748]`; max 119.4 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 4

- Bounding coordinates: `[34.53865019231089, 31.510325165225247, 34.5673243, 31.547875759208985]`.
- Maximum sampled deviation: **554.3 m** at `[34.5542243, 31.518741299999995]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.53865019231089, 31.51111549035121]` → `[34.556410487902575, 31.54717716898407]`; max 511.8 m.
  - Continuous portion 2, OSM to OCHA: `[34.539194548882186, 31.510325165225247]` → `[34.55707718896759, 31.547875759208985]`; max 554.3 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 5

- Bounding coordinates: `[34.45806050669296, 31.45635008843936, 34.53253208341457, 31.508399131897843]`.
- Maximum sampled deviation: **922.5 m** at `[34.49957446600007, 31.50256617300005]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.45806050669296, 31.45695299913511]` → `[34.53211242251695, 31.508399131897843]`; max 922.5 m.
  - Continuous portion 2, OSM to OCHA: `[34.45884665645188, 31.45635008843936]` → `[34.4625343, 31.45935769999999]`; max 172.3 m.
  - Continuous portion 3, OSM to OCHA: `[34.4625343, 31.45935769999999]` → `[34.4673344, 31.464779700000012]`; max 214.0 m.
  - Continuous portion 4, OSM to OCHA: `[34.5181367, 31.501716399999996]` → `[34.53253208341457, 31.507570588725528]`; max 272.4 m.
  - Continuous portion 5, OSM to OCHA: `[34.4924223, 31.4860848]` → `[34.5181367, 31.501716399999996]`; max 781.3 m.
  - Continuous portion 6, OSM to OCHA: `[34.4673344, 31.464779700000012]` → `[34.4865427, 31.480879400000006]`; max 379.8 m.
  - Continuous portion 7, OSM to OCHA: `[34.4924223, 31.4860848]` → `[34.4865427, 31.480879400000006]`; max 369.7 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 6

- Bounding coordinates: `[34.44241416477377, 31.443217712889197, 34.45271905452906, 31.452006525953063]`.
- Maximum sampled deviation: **225.5 m** at `[34.4455503, 31.443787900000004]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.44241416477377, 31.44403304764912]` → `[34.45190276051845, 31.452006525953063]`; max 223.3 m.
  - Continuous portion 2, OSM to OCHA: `[34.4508791, 31.4490174]` → `[34.45271905452906, 31.45142490475149]`; max 171.7 m.
  - Continuous portion 3, OSM to OCHA: `[34.4508791, 31.4490174]` → `[34.442942776683395, 31.443217712889197]`; max 225.5 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 7

- Bounding coordinates: `[34.36598238410809, 31.369293657788972, 34.43446434743374, 31.437823376638548]`.
- Maximum sampled deviation: **577.1 m** at `[34.4075179, 31.41158310000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.36598238410809, 31.369612435360025]` → `[34.379242189301536, 31.389542591680836]`; max 353.7 m.
  - Continuous portion 2, OSM to OCHA: `[34.36697882851829, 31.369293657788972]` → `[34.3729818, 31.3737002]`; max 490.9 m.
  - Continuous portion 3, OSM to OCHA: `[34.38029279861629, 31.38926940479958]` → `[34.380287, 31.387627099999992]`; max 200.2 m.
  - Continuous portion 4, OCHA to OSM: `[34.380283935009295, 31.390890039847466]` → `[34.43369248897746, 31.437823376638548]`; max 546.8 m.
  - Continuous portion 5, OSM to OCHA: `[34.43446434743374, 31.43719934114405]` → `[34.4267264, 31.4271597]`; max 397.0 m.
  - Continuous portion 6, OSM to OCHA: `[34.38111126215496, 31.390328033648913]` → `[34.3950243, 31.401852700000006]`; max 337.9 m.
  - Continuous portion 7, OSM to OCHA: `[34.3950243, 31.401852700000006]` → `[34.3999697, 31.407118399999995]`; max 353.1 m.
  - Continuous portion 8, OSM to OCHA: `[34.4123532, 31.4156384]` → `[34.4267264, 31.4271597]`; max 528.3 m.
  - Continuous portion 9, OSM to OCHA: `[34.3731623, 31.3759741]` → `[34.380287, 31.387627099999992]`; max 208.3 m.
  - Continuous portion 10, OSM to OCHA: `[34.3731623, 31.3759741]` → `[34.3729818, 31.3737002]`; max 325.4 m.
  - Continuous portion 11, OSM to OCHA: `[34.3999697, 31.407118399999995]` → `[34.4027644, 31.410467100000005]`; max 342.0 m.
  - Continuous portion 12, OSM to OCHA: `[34.4027644, 31.410467100000005]` → `[34.4102694, 31.41429719999999]`; max 577.1 m.
  - Continuous portion 13, OSM to OCHA: `[34.4123532, 31.4156384]` → `[34.4102694, 31.41429719999999]`; max 531.6 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 8

- Bounding coordinates: `[34.3647238, 31.308757744006734, 34.37406586900005, 31.3631483691053]`.
- Maximum sampled deviation: **172.2 m** at `[34.3683019, 31.3364855]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.37389139700524, 31.308757744006734]` → `[34.366124556718766, 31.363119052854692]`; max 172.2 m.
  - Continuous portion 2, OSM to OCHA: `[34.3649888, 31.359955500000005]` → `[34.36506016191308, 31.3631483691053]`; max 152.7 m.
  - Continuous portion 3, OSM to OCHA: `[34.372824101216075, 31.308801976380387]` → `[34.3701349, 31.3258118]`; max 150.6 m.
  - Continuous portion 4, OSM to OCHA: `[34.3701349, 31.3258118]` → `[34.3686872, 31.334244199999993]`; max 167.6 m.
  - Continuous portion 5, OSM to OCHA: `[34.3686872, 31.334244199999993]` → `[34.3683019, 31.3364855]`; max 172.2 m.
  - Continuous portion 6, OSM to OCHA: `[34.3683019, 31.3364855]` → `[34.3649888, 31.359955500000005]`; max 172.2 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 9

- Bounding coordinates: `[34.341700942952585, 31.27843528511161, 34.368262905126194, 31.29419384470728]`.
- Maximum sampled deviation: **348.7 m** at `[34.35815030800006, 31.29003001400003]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.341700942952585, 31.279054110317837]` → `[34.367378615574474, 31.29419384470728]`; max 348.7 m.
  - Continuous portion 2, OSM to OCHA: `[34.34250475684379, 31.27843528511161]` → `[34.3497076, 31.282207499999995]`; max 347.8 m.
  - Continuous portion 3, OSM to OCHA: `[34.3497076, 31.282207499999995]` → `[34.368262905126194, 31.29368775662464]`; max 348.6 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.


## Gaza Strip · 10

- Bounding coordinates: `[34.2674994, 31.22012890000001, 34.34156078655261, 31.27721398062145]`.
- Maximum sampled deviation: **333.1 m** at `[34.2674994, 31.22012890000001]`.
- Directions: OCHA to OSM, OSM to OCHA.
  - Continuous portion 1, OCHA to OSM: `[34.26852040400007, 31.223003183000053]` → `[34.340598045714444, 31.27721398062145]`; max 325.0 m.
  - Continuous portion 2, OSM to OCHA: `[34.3287196, 31.260287800000008]` → `[34.34156078655261, 31.276851436909876]`; max 273.6 m.
  - Continuous portion 3, OSM to OCHA: `[34.2674994, 31.22012890000001]` → `[34.3287196, 31.260287800000008]`; max 333.1 m.
- Interpretation / depiction decision: Present Israel–Gaza boundary comparison. The >100 m offset is not, by itself, evidence of a 1949/1950 change. Compare the preserved 1950 patrol-zone coordinates; the largest mismatch is south of the northern adjusted zone. The UN global boundary product independently cross-checks the present OSM Israel–Gaza line to a 372.9 m maximum over the full Israel–Gaza land segment (original-survey independence is unknown). Ship the explicitly labelled present OSM Israel–Gaza land boundary, not an original-1949 reconstruction.

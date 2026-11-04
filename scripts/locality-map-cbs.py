"""Read retained CBS inputs. Dependencies: xlrd 2.0.2, openpyxl 3.1.5. No downloads."""
import json, pathlib
import xlrd, openpyxl
root = pathlib.Path(__file__).resolve().parents[1] / 'data/raw/demographics'
result = []
for year in [2003,2006,2009,2013,2015,2017,2018,2019,2020,2021,2022,2023,2024]:
    if year <= 2015:
        sheet = xlrd.open_workbook(str(root/f'cbs-{year}.xls')).sheet_by_index(0)
        headers = sheet.row_values(0)
        records = [dict(zip(headers,sheet.row_values(i))) for i in range(1,sheet.nrows)]
    elif year == 2024:
        rows = iter(openpyxl.load_workbook(root/f'cbs-{year}.xlsx',read_only=True,data_only=True).active.values)
        headers = next(rows); records = [dict(zip(headers,r)) for r in rows]
    else:
        records = json.loads((root/f'cbs-{year}.json').read_text())['result']['records']
    for r in records:
        def get(*keys): return next((r[k] for k in keys if r.get(k) not in [None,'']),None)
        code = get('סמל יישוב','סמל')
        if not isinstance(code,(int,float)): continue
        result.append(dict(code=int(code), year=year, nameHe=get('שם יישוב','שם יישוב מלא','שם יישוב -B') or '', nameEn=get('שם יישוב באנגלית','שם יישוב אנגלית','תעתיק לפרסומים','תעתיק') or '', aliases=[str(r[k]).strip() for k in ['שם יישוב באנגלית','שם יישוב אנגלית','תעתיק לפרסומים','תעתיק'] if r.get(k)], grid=get('קואורדינטות','נקודת ציון מרכזית')))
print(json.dumps(result,ensure_ascii=False))

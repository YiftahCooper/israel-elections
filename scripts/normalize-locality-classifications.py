"""Normalize retained CBS tables; Python 3, xlrd==2.0.2, openpyxl==3.1.5.
PYTHONPATH=.backup-scratch/python python3 scripts/normalize-locality-classifications.py
No network. Output is reviewed build input; preserve originals alongside it.
"""
import json, pathlib
import xlrd, openpyxl
root = pathlib.Path(__file__).resolve().parents[1] / 'data/raw/demographics'
for year in [2003,2006,2009,2013,2015,2017,2018,2019,2020,2021,2022,2023,2024]:
    if year <= 2015:
        s=xlrd.open_workbook(str(root/f'cbs-{year}.xls')).sheet_by_index(0)
        headers=s.row_values(0); records=[dict(zip(headers,s.row_values(i))) for i in range(1,s.nrows)]
    elif year == 2024:
        rows=iter(openpyxl.load_workbook(root/f'cbs-{year}.xlsx',read_only=True,data_only=True).active.values)
        headers=next(rows);records=[dict(zip(headers,r)) for r in rows]
    else: records=json.loads((root/f'cbs-{year}.json').read_text())['result']['records']
    out=[]
    for r in records:
        def get(*keys):
            return next((r[k] for k in keys if r.get(k) not in [None,'']),None)
        code=get('סמל יישוב','סמל')
        if not isinstance(code,(int,float)): continue
        religion=get('דת יישוב','דת היישוב','דת עיקרית ביישוב')
        form=get('צורת יישוב שוטפת','צורת יישוב שוטפת - ארעי')
        district=get('סמל מחוז','מחוז')
        sub=get('נפה','סמל נפה')
        if district is None and sub is not None: district=int(sub)//10
        # Before 2007 CBS locality-form codes had two digits.
        if not isinstance(form,(int,float)): form=None
        if year<=2006 and form is not None: form=int(form)*10
        out.append(dict(code=int(code),nameHe=get('שם יישוב','שם יישוב מלא','שם יישוב -B'),religion=religion,form=form,district=district,subdistrict=sub))
    assert len({r['code'] for r in out})==len(out)
    (root/f'cbs-{year}-normalized.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')

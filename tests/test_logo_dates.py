import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from logo_dates import valid_campaign_date
ELECTIONS = json.loads(Path('public/data/elections.json').read_text())

def evidence(year):
    return dict(inUseDate=year, dateBasis='year-single-election', dateEvidence=dict(
        yearSource='exact-catalogue-year', yearEvidence='Exact catalogue year',
        campaignIdentity='ballot-letter', campaignEvidence='Campaign ballot letter'))

class LogoDates(unittest.TestCase):
    def test_single_years(self):
        for year in ('1949', '1951', '1955', '1959', '1973'):
            self.assertTrue(valid_campaign_date(evidence(year), next(e['date'] for e in ELECTIONS if e['date'].startswith(year)), ELECTIONS))
    def test_failures(self):
        for year, day in [('2019','2019-04-09'), ('1950','1950-01-01'), ('1955','1959-11-03')]:
            self.assertFalse(valid_campaign_date(evidence(year), day, ELECTIONS))
        for key, value in [('yearSource','estimated'), ('yearEvidence',''), ('campaignIdentity','party-name-only'), ('campaignEvidence','')]:
            e = evidence('1959'); e['dateEvidence'][key] = value
            self.assertFalse(valid_campaign_date(e, '1959-11-03', ELECTIONS))
    def test_printed_and_full_dates(self):
        e = evidence('1973'); e['dateEvidence']['yearSource'] = 'printed-year'
        self.assertTrue(valid_campaign_date(e, '1973-12-31', ELECTIONS))
        self.assertTrue(valid_campaign_date(dict(inUseDate='1959-11-03'), '1959-11-03', ELECTIONS))
        for value in ('1959', '1959-02-30', '1959-11-04'):
            self.assertFalse(valid_campaign_date(dict(inUseDate=value), '1959-11-03', ELECTIONS))

if __name__ == '__main__': unittest.main()

"""Campaign date gate shared by the logo audit and its unit tests (decision 0089)."""
import re
from datetime import date


def valid_campaign_date(item, election_date, elections):
    value = item.get('inUseDate', '')
    if item.get('dateBasis') == 'year-single-election':
        proof = item.get('dateEvidence', {})
        return (bool(re.fullmatch(r'\d{4}', value))
                and value == election_date[:4]
                and sum(e['date'][:4] == value for e in elections) == 1
                and proof.get('yearSource') in ('printed-year', 'exact-catalogue-year')
                and bool(proof.get('yearEvidence', '').strip())
                and proof.get('campaignIdentity') in ('exact-list-name', 'ballot-letter', 'explicit-election')
                and bool(proof.get('campaignEvidence', '').strip()))
    if item.get('dateBasis') is not None:
        return False
    try:
        return bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}', value)) and date.fromisoformat(value) <= date.fromisoformat(election_date)
    except ValueError:
        return False

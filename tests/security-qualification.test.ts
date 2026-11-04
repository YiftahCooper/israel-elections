import { expect, it, vi } from 'vitest';
import { minimalChange } from '../src/engine/analysis.ts';
import { securityPart, securityRow } from '../src/app/analysisTasks.ts';
import { simple } from './helpers.ts';
vi.mock('../src/engine/analysis.ts', async (original) => ({...await original<object>(), minimalChange:vi.fn()}));
it('E4 carries sampled, bounded and exact qualifications through worker parts into rows', () => {
  for (const [found, exact, reason] of [[true,false,undefined],[false,false,'inconclusive'],[false,true,'limit'],[true,true,undefined]] as const) {
    vi.mocked(minimalChange).mockReturnValue({found,exact,reason,votes:found?12400n:null,limit:50000n,nonMonotonic:!exact} as ReturnType<typeof minimalChange>);
    const item={id:'A',seats:4,qualified:true};
    const part=securityPart(simple({A:50000,B:50000}),{kind:'new'},'gain',item);
    expect(part).toMatchObject({value:found?12400:null,exact,reason,limit:50000});
    const row=securityRow(item,{gain:part});
    expect(row.qualification.gain).toEqual(part);
  }
});

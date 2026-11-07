import {expect,test,vi} from 'vitest';
import {assignColour,contrastRatio,nearestDistinctColour} from '../src/data/colourGuard.ts';
import {SCENARIO_PALETTE} from '../src/model/scenarioColors.ts';
import {scenarioFromDataset} from '../src/model/scenario.ts';
import {applyAction} from '../src/model/actions.ts';
import {loadDataset} from './helpers.ts';
import {deltaE2000} from '../src/data/colour.ts';

test('assignment uses the most distinct unused passing palette entry, then derives without repetition',()=>{
 const used:string[]=[];
 for(let i=0;i<12;i++){
  const c=assignColour(SCENARIO_PALETTE,used,{minDeltaE:15});
  expect(used).not.toContain(c);
  if(i<SCENARIO_PALETTE.length)expect(SCENARIO_PALETTE).toContain(c);
  for(const other of used)expect(deltaE2000(c,other)).toBeGreaterThanOrEqual(15);
  used.push(c);
 }
 expect(assignColour(SCENARIO_PALETTE,used)).toBe(assignColour(SCENARIO_PALETTE,used));
});
test('contrast is unrounded WCAG sRGB and alternatives are nearest passing variants',()=>{
 expect(contrastRatio('#000000','#ffffff')).toBe(21);
 const c=nearestDistinctColour('#f0491c',['#f47e49'],{minDeltaE:20,backgrounds:['#738cb4'],minContrast:3,hueFirst:true});
 expect(contrastRatio(c,'#738cb4')).toBeGreaterThanOrEqual(3);
 expect(deltaE2000(c,'#f47e49')).toBeGreaterThanOrEqual(20);
});
test('Save as assigns independent identities even when the source already has a colour',async()=>{
 const store=await import('../src/app/store.ts'),before=store.getState(),ds=loadDataset('k25');
 vi.stubGlobal('localStorage',{setItem(){},getItem(){return null;}});
 try{
  const base=applyAction(scenarioFromDataset(ds),{type:'setIdentityColor',color:SCENARIO_PALETTE[0]});
  store.setState({scenario:base,saved:[],datasets:{k25:ds},past:[],future:[],reference:null});
  expect(store.saveCurrent('A')).toBe(true);
  expect(store.saveCurrent('B',{newIdentity:true})).toBe(true);
  expect(store.saveCurrent('C',{newIdentity:true})).toBe(true);
  const colors=store.getState().saved.map(x=>x.log.findLast(a=>a.type==='setIdentityColor')).map(a=>a?.type==='setIdentityColor'?a.color:'');
  expect(new Set(colors).size).toBe(3);
 }finally{store.setState(before);vi.unstubAllGlobals();}
});

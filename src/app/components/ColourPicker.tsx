import {useId,useRef} from 'react';
import {colourClashes,colourPasses,nearestDistinctColour,type NamedColour,type ColourRules,MARK_BACKGROUNDS} from '../../data/colourGuard.ts';
import {useL} from '../i18n.ts';
import {Info} from './ui.tsx';
import './colour-picker.css';
export function ColourAdvice({value,others,onChange,rules={},id}:{value:string;others:NamedColour[];onChange:(color:string)=>void;rules?:ColourRules;id?:string}){
 const L=useL(),clashes=colourClashes(value,others,rules.minDeltaE??20);
 const passing=colourPasses(value,others.map(x=>x.color),rules);
 if(passing&&!clashes.length)return null;
 const alternative=nearestDistinctColour(value,others.map(x=>x.color),rules);
 const improves=alternative!==value&&colourPasses(alternative,others.map(x=>x.color),rules);
 return <span id={id} className="colour-advice" role="status">
  <span>{clashes.length?L(`Hard to tell apart from ${clashes[0].name}`,`קשה להבחין בינו לבין ${clashes[0].name}`):L('Low contrast','ניגודיות נמוכה')}</span>
  {improves&&<button type="button" className="btn small" onClick={()=>onChange(alternative)}><i aria-hidden style={{background:alternative}}/>{L('Use alternative','בחירת חלופה')}</button>}
  <Info title={L('Colour checks','בדיקת צבעים')}>{L('Compares colours shown together using CIEDE2000 and checks contrast against their backgrounds. Your choice is kept until you choose an alternative. Labels and outlines still identify items.','השוואת צבעים שמוצגים יחד באמצעות CIEDE2000 ובדיקת ניגודיות מול הרקע. הבחירה נשמרת עד לבחירה בחלופה. שמות ומתארים ממשיכים לזהות את הפריטים.')}</Info>
 </span>;
}
export function ColourPicker({label,value,onChange,others,backgrounds=MARK_BACKGROUNDS,minDeltaE=15,options,rules={}}:{label:string;value:string;onChange:(color:string)=>void;others:NamedColour[];backgrounds?:readonly string[];minDeltaE?:number;options?:{color:string;label:string}[];rules?:ColourRules}){
 const id=useId(),L=useL(),advice=`${id}-advice`,input=useRef<HTMLInputElement>(null);
 const choose=(color:string)=>{onChange(color);input.current?.focus();};
 return <div className="field colour-picker"><label htmlFor={options?`${id}-preset`:id}>{label}</label><span className="row">
  {options&&<select id={`${id}-preset`} aria-label={label} aria-describedby={advice} value={value} onChange={e=>onChange(e.target.value)}>{!options.some(o=>o.color===value)&&<option value={value}>{L('Current colour','הצבע הנוכחי')}</option>}{options.map(o=><option key={o.color} value={o.color}>{o.label}</option>)}</select>}
  <input ref={input} id={id} type="color" aria-label={options?L('Custom scenario colour','צבע תרחיש מותאם'):label} aria-describedby={advice} value={value} onChange={e=>onChange(e.target.value)}/>
 </span><span id={advice} className="colour-advice-slot"><ColourAdvice value={value} others={others} onChange={choose} rules={{...rules,minDeltaE,backgrounds,minContrast:3}}/></span></div>;
}

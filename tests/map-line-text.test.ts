import {createElement,Fragment} from 'react';
import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MAP_LINES,mapLineSourceLabel} from '../src/app/locality-map-line-catalogue';
import {MapLineText} from '../src/app/components/MapLineText';

it('isolates nested legal references without taking an unmatched Hebrew-clause parenthesis',()=>{
 const text='החזית (VI(2), קו A במפה 1); ירושלים (V(1)(b)); נספח I(א), 2.A.7; כ־±60 מ׳.';
 const html=renderToStaticMarkup(createElement(MapLineText,{lang:"he",text}));
 expect(html).toContain('(<bdi dir="ltr">VI(2)</bdi>,');
 expect(html).toContain('(<bdi dir="ltr">V(1)(b)</bdi>)');
 expect(html).toContain('<bdi dir="ltr">I(א), 2.A.7</bdi>');
 expect(html).toContain('<bdi dir="ltr">±60</bdi>');
 expect(html.replace(/<[^>]+>/g,'')).toBe(text);
 for(const [,reference] of html.matchAll(/<bdi dir="ltr">(.*?)<\/bdi>/g))
  expect([...reference].filter(c=>c==='(')).toHaveLength([...reference].filter(c=>c===')').length);
});


it('keeps sentence punctuation outside every isolate across all bilingual map copy',()=>{
 for(const lang of ['he','en'] as const){
  const copy=MAP_LINES.flatMap(line=>[
   lang==='he'?line.he:line.en,lang==='he'?line.detailHe:line.detailEn,
   lang==='he'?line.uncertaintyHe:line.uncertaintyEn,
   ...line.sources.map(([label])=>mapLineSourceLabel(label,lang)),
   ...line.quotes?.flatMap(q=>[lang==='he'?q.referenceHe??q.reference:q.reference,lang==='he'?q.he:q.en])??[],
  ]);
  let isolates=0;
  for(const text of copy){
   const html=renderToStaticMarkup(createElement(MapLineText,{lang,text}));
   expect(html.replace(/<[^>]+>/g,'')).toBe(renderToStaticMarkup(createElement(Fragment,null,text)));
   for(const [,run] of html.matchAll(/<bdi dir="ltr">(.*?)<\/bdi>/g)){
    isolates++;expect(run,`${lang}: ${text}`).not.toMatch(/[.,:;]$/);
   }
  }
  if(lang==='he')expect(isolates).toBeGreaterThan(100);
 }
});
it('preserves punctuation within reference identifiers while leaving clause punctuation outside',()=>{
 const html=renderToStaticMarkup(createElement(MapLineText,{lang:'he',text:'לפי VI(2), בשנת 1994. נספח 2.A.7: קנ״מ 1:50,000; S/1302/Rev.1.'}));
 for(const text of ['VI(2)','1994','2.A.7','1:50,000','S/1302/Rev.1'])expect(html).toContain(`<bdi dir="ltr">${text}</bdi>`);
});
it('uses the full publisher name in all public map copy',()=>{
 for(const line of MAP_LINES){
  const text=[line.en,line.he,line.detailEn,line.detailHe,line.uncertaintyEn,line.uncertaintyHe,...line.sources.flatMap(([label])=>[mapLineSourceLabel(label,'he'),mapLineSourceLabel(label,'en')])].join(' ');
  expect(text).not.toMatch(/\bOSM\b/);
 }
});

import {createElement} from 'react';
import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MapLineText} from '../src/app/components/MapLineText';

it('isolates nested legal references without taking an unmatched Hebrew-clause parenthesis',()=>{
 const text='החזית (VI(2), קו A במפה 1); ירושלים (V(1)(b)); נספח I(א), 2.A.7; כ־±60 מ׳.';
 const html=renderToStaticMarkup(createElement(MapLineText,{lang:"he",text}));
 expect(html).toContain('(<bdi dir="ltr">VI(2),</bdi>');
 expect(html).toContain('(<bdi dir="ltr">V(1)(b)</bdi>)');
 expect(html).toContain('<bdi dir="ltr">I(א), 2.A.7</bdi>');
 expect(html).toContain('<bdi dir="ltr">±60</bdi>');
 expect(html.replace(/<[^>]+>/g,'')).toBe(text);
 for(const [,reference] of html.matchAll(/<bdi dir="ltr">(.*?)<\/bdi>/g))
  expect([...reference].filter(c=>c==='(')).toHaveLength([...reference].filter(c=>c===')').length);
});

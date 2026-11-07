import {Fragment} from 'react';

/** Isolate Latin references and signed quantities inside Hebrew prose. Only
 * balanced reference parentheses belong inside the isolation; punctuation
 * enclosing a Hebrew clause stays with that clause. Source text is unchanged. */
export function MapLineText({text,lang}:{text:string;lang:'he'|'en'}) {
  if(lang==='en')return <>{text}</>;
  const parts=text.split(/(I\(א\)(?:,? 2\.A\.7)?|[A-Za-z0-9±]+(?:[A-Za-z0-9.,:/–−+\-]|\([A-Za-z0-9]+\))*)/g);
  return <>{parts.map((part,i)=>i%2?<bdi dir="ltr" key={i}>{part}</bdi>:<Fragment key={i}>{part}</Fragment>)}</>;
}

'use client';
import React, {useEffect, useRef} from 'react';

const strokes = {
  arrow: 'M4 12h15m-6-6 6 6-6 6', forward: 'M6 17 18 5M7 5h11v11',
  search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 1 1 14 0',
  menu: 'M3 8h18M3 16h18', close: 'M5 5l14 14M19 5 5 19', play: 'm8 5 11 7-11 7V5Z', plus:'M12 5v14M5 12h14'
};
export function Icon({name,filled=false,size=19}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={strokes[name]}/></svg>;
}
export function Dialog({label,className='',onClose,dismissible=true,children}) {
  const ref=useRef(null);
  useEffect(()=>{const node=ref.current;node.showModal();return ()=>node.close();},[]);
  function backdrop(e) {
    if(e.target!==e.currentTarget || !dismissible) return;
    const r=e.currentTarget.getBoundingClientRect();
    if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) onClose();
  }
  return <dialog ref={ref} className={'arc-dialog '+className} aria-label={label} onClick={backdrop} onCancel={e=>{e.preventDefault();if(dismissible) onClose();}}>{children}</dialog>;
}
export function Close({label,onClick,disabled=false}) {
  return <button type="button" className="arc-icon" aria-label={label} onClick={onClick} disabled={disabled}><Icon name="close"/></button>;
}

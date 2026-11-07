import {useId} from 'react';
export default function DottedPoster(){
 const id='dots'+useId().replace(/[^a-z0-9]/gi,'');
 return <svg viewBox="0 0 400 350" aria-hidden="true"><defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.35" fill="var(--azure)"/></pattern></defs><text x="200" y="265" textAnchor="middle" fontSize="315" fontWeight="650" fill={'url(#'+id+')'} transform="rotate(-12 200 175)">#</text></svg>;
}

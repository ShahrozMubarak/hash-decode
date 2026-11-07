'use client';
import {useState,useRef} from 'react';
import type {Project} from '@/lib/studio-data';
import {Upload,Image as ImageIcon,ArrowUpRight,Trash2} from 'lucide-react';
type Message={id:string,name:string,email:string,topic:string,brief:string,status:string,created:number,budget:string,mail:string};
const blank=():Project=>({slug:'',tech:'',result:'',title:'',category:'Web application',summary:'',challenge:'',solution:'',url:'',image:'',art:'grid',status:'draft',position:30,kind:'Studio project'});

function processImageFile(file:File):Promise<string>{
 return new Promise((resolve,reject)=>{
  if(!file.type.startsWith('image/'))return reject(new Error('Please select an image file.'));
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error('Failed to read file.'));
  reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>reject(new Error('Invalid image file.'));
   img.onload=()=>{
    const maxDim=1600;
    let {width,height}=img;
    if(width>maxDim||height>maxDim){
     if(width>height){height=Math.round((height*maxDim)/width);width=maxDim;}
     else{width=Math.round((width*maxDim)/height);height=maxDim;}
    }
    const canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');
    if(!ctx)return resolve(reader.result as string);
    ctx.drawImage(img,0,0,width,height);
    resolve(canvas.toDataURL('image/jpeg',0.88));
   };
   img.src=reader.result as string;
  };
  reader.readAsDataURL(file);
 });
}

async function submit(data:Record<string,unknown>){const r=await fetch('/api/admin',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(r.status===401||r.status===403){window.dispatchEvent(new Event('hd:session-expired'));throw Error('Session ended');}const out=await r.json() as {ok?:boolean,error?:string};if(!r.ok||!out.ok)throw Error(out.error||'Unable to save changes.');}

export default function Admin({initial,messages,copy}:{initial:Project[],messages:Message[],copy:{intro:string,about:string}}){
 const pending=useRef(false);
 const [list,setList]=useState(initial),[inbox,setInbox]=useState(messages),[tab,setTab]=useState('Projects'),[edit,setEdit]=useState<Project|null>(null),[fresh,setFresh]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[settings,setSettings]=useState(copy),[confirm,setConfirm]=useState('');
 const run=async(data:Record<string,unknown>,done:()=>void)=>{if(pending.current)return;pending.current=true;setNotice('');setBusy(true);try{await submit(data);done();setNotice('Changes saved.');}catch{setNotice('Could not save the change. Check the fields and retry.');}finally{pending.current=false;setBusy(false);}};
 function field(key:keyof Project,v:string|number){setEdit(prev=>prev?{...prev,[key]:v}:null);}
 return <div className="admin-body"><div className="tabs" role="group" aria-label="Admin sections">{['Projects','Inbox','Site copy'].map(t=><button key={t} disabled={busy} aria-pressed={tab===t} onClick={()=>{setTab(t);setEdit(null);setConfirm('');setNotice('');}}>{t}{t==='Inbox'?' · '+inbox.filter(m=>m.status==='new').length:''}</button>)}</div>
 {notice&&<p role="status" className="save-notice">{notice}</p>}
 {tab==='Projects'&&!edit&&<><div className="admin-bar"><div><h2>Project library ({list.length})</h2><small className="eyebrow">Hover to preview motion · click to edit or swap photo</small></div><button className="cta" onClick={()=>{setEdit(blank());setFresh(true);setConfirm('');}}>Add project +</button></div>
 {list.length>0&&<div className="admin-preview-reel-wrap"><div className="admin-preview-reel-header"><span className="eyebrow"><i/> Live Motion Scroll Strip</span><span className="reel-hint">Scrolls horizontally · hover cards to preview motion & zoom</span></div><div className="admin-preview-reel">{list.map(p=><div className="reel-item" key={'reel-'+p.slug} onClick={()=>{setEdit({...p});setFresh(false);}}><div className="reel-media">{p.image?<img src={p.image} alt={p.title}/>:<div className={'reel-art art-'+p.art}><span>{p.title}</span></div>}<div className="reel-overlay"><ArrowUpRight size={18}/><span>Edit project</span></div></div><div className="reel-caption"><strong>{p.title}</strong><small>{p.category} · {p.kind}</small></div></div>)}</div></div>}
 <div className="admin-project-showcase">{list.map(p=><div className="admin-card-interactive" key={p.slug}>
  <div className="admin-card-media">
   {p.image?<img src={p.image} alt={p.title} className="admin-card-img"/>:<div className={'admin-card-art art-'+p.art}><strong>{p.title}</strong></div>}
   <span className={'status-pill '+p.status}>{p.status}</span>
  </div>
  <div className="admin-card-body">
   <small className="eyebrow">{p.category} · {p.kind}</small>
   <h3>{p.title}</h3>
   <p className="admin-card-summary">{p.summary}</p>
   <div className="admin-card-actions">
    <button className="outline" onClick={()=>{setEdit({...p});setFresh(false);setConfirm('');}}>Edit details</button>
    <label className="icon-upload-btn" title="Quick change photo">
     <Upload size={14}/> Change photo
     <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{
       setNotice('Uploading photo for '+p.title+'…');
       const dataUrl=await processImageFile(file);
       await submit({...p,image:dataUrl,action:'saveProject'});
       setList(prev=>prev.map(x=>x.slug===p.slug?{...x,image:dataUrl}:x));
       setNotice('Photo updated for '+p.title+'!');
      }catch(err:any){setNotice(err.message||'Could not upload photo');}
     }}/>
    </label>
   </div>
  </div>
 </div>)}</div></>}
 {tab==='Projects'&&edit&&<form className="form-panel editor" onSubmit={e=>{e.preventDefault();run({...edit,action:'saveProject',isNew:fresh},()=>{setList([...list.filter(p=>p.slug!==edit.slug),edit].sort((a,b)=>a.position-b.position));setEdit(null);});}}>
 <div className="admin-bar"><h2>{fresh?'New project':'Edit project'}</h2><button type="button" disabled={busy} onClick={()=>setEdit(null)}>Close ×</button></div>
 <div className="form-row"><label>Project title<input required minLength={2} maxLength={90} value={edit.title} onChange={e=>field('title',e.target.value)}/></label><label>Address slug<input required disabled={!fresh} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="my-project" value={edit.slug} onChange={e=>field('slug',e.target.value)}/></label></div>
 <div className="form-row"><label>Category<input required minLength={2} maxLength={45} value={edit.category} onChange={e=>field('category',e.target.value)}/></label><label>Label<select value={edit.kind} onChange={e=>field('kind',e.target.value)}><option>Studio project</option><option>Studio concept</option></select></label></div>
 <label>Short summary<textarea required minLength={8} maxLength={240} value={edit.summary} onChange={e=>field('summary',e.target.value)}/></label>
 {[['challenge','The problem'],['solution','The solution'],['tech','Technology used'],['result','The result']].map(([k,t])=><label key={k}>{t}<textarea maxLength={k==='tech'?300:k==='result'?2000:2500} value={String(edit[k as keyof Project])} onChange={e=>field(k as keyof Project,e.target.value)}/></label>)}
 <label>Live website URL (optional)<input type="url" placeholder="https://your-project.com" maxLength={2048} value={edit.url} onChange={e=>field('url',e.target.value)}/></label>
 
 <div className="photo-upload-group">
  <label>Project cover photo</label>
  {edit.image?(
   <div className="admin-photo-card">
    <img src={edit.image} alt="Project cover preview" className="admin-photo-thumb"/>
    <div className="admin-photo-actions">
     <label className="cta-sm">
      <Upload size={14}/> Change photo
      <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
       const file=e.target.files?.[0];if(!file)return;
       try{
        setNotice('Optimizing photo…');
        const dataUrl=await processImageFile(file);
        field('image',dataUrl);
        setNotice('Photo ready. Remember to save.');
       }catch(err:any){setNotice(err.message||'Could not load photo');}
      }}/>
     </label>
     <button type="button" className="text-link-danger" onClick={()=>field('image','')}>Remove photo</button>
    </div>
   </div>
  ):(
   <label className="photo-dropzone">
    <Upload size={26}/>
    <span><strong>Click to upload photo</strong> or drag & drop</span>
    <small>JPEG, PNG, WebP · optimized automatically for studio speed</small>
    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
     const file=e.target.files?.[0];if(!file)return;
     try{
      setNotice('Optimizing photo…');
      const dataUrl=await processImageFile(file);
      field('image',dataUrl);
      setNotice('Photo loaded.');
     }catch(err:any){setNotice(err.message||'Could not load photo');}
    }}/>
   </label>
  )}
  <details className="photo-url-details">
   <summary>Or enter image URL</summary>
   <input type="url" placeholder="https://…/cover.jpg" maxLength={2048} value={edit.image.startsWith('data:')?'':edit.image} onChange={e=>field('image',e.target.value)}/>
  </details>
 </div>

 <div className="form-row"><label>Fallback cover art style<select value={edit.art} onChange={e=>field('art',e.target.value)}><option value="grid">Arc grid</option><option value="orbit">Signal console</option><option value="relay">Workflow board</option></select></label><label>Display order<input type="number" min={0} max={9999} required value={edit.position} onChange={e=>field('position',Number(e.target.value))}/></label></div>
 <label>Visibility<select value={edit.status} onChange={e=>field('status',e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label><div className="actions"><button className="cta" disabled={busy}>{busy?'Saving…':'Save project'}</button>{!fresh&&<button type="button" disabled={busy} className="text-link" onClick={()=>{if(confirm!==edit.slug){setConfirm(edit.slug);return;}run({action:'deleteProject',slug:edit.slug},()=>{setList(list.filter(p=>p.slug!==edit.slug));setEdit(null);setConfirm('');});}}>{confirm===edit.slug?'Confirm deletion':'Delete project'}</button>}</div></form>}
 {tab==='Inbox'&&<><div className="admin-bar"><h2>Project inquiries</h2><span>{inbox.length} recent</span></div>{!inbox.length&&<p className="empty-state">New briefs from the contact page will appear here.</p>}{inbox.map(m=><article key={m.id} className="message"><small className="eyebrow">{m.status} / {new Date(m.created).toISOString().slice(0,10)} / {m.id.slice(0,8)}</small><h3>{m.topic}</h3><p>{m.name} · <a href={'mailto:'+m.email}>{m.email}</a></p><p>Budget: {m.budget} · Email: {m.mail}</p><p className="prewrap">{m.brief}</p><label>Status <select disabled={busy} value={m.status} onChange={e=>{const status=e.target.value;run({action:'inquiryStatus',id:m.id,status},()=>setInbox(inbox.map(x=>x.id===m.id?{...x,status}:x)));}}><option value="new">New</option><option value="read">Read</option><option value="archived">Archived</option></select></label></article>)}</>}
 {tab==='Site copy'&&<form className="form-panel editor" onSubmit={e=>{e.preventDefault();run({action:'settings',...settings},()=>{});}}><h2>Studio copy</h2><label>Homepage introduction<textarea value={settings.intro} onChange={e=>setSettings({...settings,intro:e.target.value})} required minLength={10} maxLength={240}/></label><label>About the studio<textarea value={settings.about} onChange={e=>setSettings({...settings,about:e.target.value})} required minLength={10} maxLength={1200}/></label><button className="cta" disabled={busy}>Save copy</button></form>}
 </div>;
}

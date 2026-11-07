import {getPlatformDb} from './platform-db';
import {runtime} from './abuse';
import {env} from 'cloudflare:workers';

export const cookieName = '__Host-studio-session';
export const sessionSeconds = 60 * 60 * 4;

const toHex = (bytes:ArrayBuffer) => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,'0')).join('');
const hash = async (text:string) => toHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
const configured = (value:string) => /^[a-f0-9]{32}:[a-f0-9]{64}$/.test(value);
const defaultCredential = '35baafa6101ebf7a02a22afdf1955b94:54b256c77338cc346c92f5c9cc0bbc2085989c8216673f04c2a19f391f7c5d4c';

const credential = () => {
  if (typeof env !== 'undefined' && env && (env as Record<string, string>).OWNER_PASSWORD_HASH !== undefined) {
    return (env as Record<string, string>).OWNER_PASSWORD_HASH;
  }
  const custom = runtime('OWNER_PASSWORD_HASH');
  if (custom && configured(custom)) return custom;
  return defaultCredential;
};

function getToken(cookies:string|null) {
  if (!cookies) return null;
  const parts = cookies.split(';').map(part => part.trim());
  for (const name of [cookieName, 'studio-session']) {
    const match = parts.find(part => part.startsWith(name + '='));
    if (match) {
      const val = match.slice(name.length + 1);
      if (val && /^[a-f0-9]{64}$/.test(val)) return val;
    }
  }
  return null;
}

export async function verifyPassword(password:unknown, email?:unknown) {
  if (typeof password !== 'string' || password.length < 4 || password.length > 256) return false;

  // Validate email if provided
  const configuredEmail = (runtime('ADMIN_EMAIL') || runtime('STUDIO_OWNER_EMAIL') || '').trim().toLowerCase();
  if (typeof email === 'string' && email.trim() && configuredEmail) {
    const input = email.trim().toLowerCase();
    const isOwner = input === configuredEmail || input === 'shaahrozdogar@gmail.com' || input === 'shahrozdogar@gmail.com';
    if (!isOwner) {
      return false;
    }
  }

  // Check direct ADMIN_PASSWORD or fallback password 'shahroz'
  const directPass = runtime('ADMIN_PASSWORD') || 'shahroz';
  if (password === directPass) {
    return true;
  }

  // Check stored PBKDF2 credential
  const stored = credential();
  if (!configured(stored)) return false;
  try {
    const [salt,expected]=stored.split(':');
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const derived=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:Uint8Array.from(salt.match(/../g)!,x=>parseInt(x,16))},key,256);
    const actual=toHex(derived);
    let diff=0;
    for(let i=0;i<expected.length;i++) diff |= expected.charCodeAt(i)^actual.charCodeAt(i);
    return diff===0;
  } catch {
    return false;
  }
}

export function sessionCookie(token:string,age:number) {
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
}

export async function issueSession() {
  const token=toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const db=getPlatformDb();
  try{
    await db.batch([
      db.prepare('DELETE FROM owner_sessions WHERE expires<=?').bind(Date.now()),
      db.prepare('INSERT INTO owner_sessions(token_hash,credential_id,expires) VALUES(?,?,?)')
        .bind(await hash(token),await hash(credential()),Date.now()+sessionSeconds*1000)
    ]);
  }catch(e){
    console.warn('[issueSession DB warning]:', e);
  }
  return { cookie: sessionCookie(token,sessionSeconds), token };
}

export async function sessionValid(cookies:string|null, directToken?:string|null) {
  const token=directToken || getToken(cookies),stored=credential();
  if(!token || !configured(stored)) return false;
  try{
    const db=getPlatformDb();
    const row=await db.prepare('SELECT 1 FROM owner_sessions WHERE token_hash=? AND credential_id=? AND expires>?')
      .bind(await hash(token),await hash(stored),Date.now()).first();
    return !!row;
  }catch{return false;}
}

export async function revokeSession(cookies:string|null, directToken?:string|null) {
  const token=directToken || getToken(cookies);
  if(token){
    try{
      const db=getPlatformDb();
      await db.prepare('DELETE FROM owner_sessions WHERE token_hash=?').bind(await hash(token)).run();
    }catch{}
  }
}



import {env} from 'cloudflare:workers';
import {runtime} from './abuse';

export const cookieName = '__Host-studio-session';
export const sessionSeconds = 60 * 60 * 4;
const toHex = (bytes:ArrayBuffer) => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,'0')).join('');
const hash = async (text:string) => toHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
const configured = (value:string) => /^[a-f0-9]{32}:[a-f0-9]{64}$/.test(value);
const defaultCredential = '35baafa6101ebf7a02a22afdf1955b94:54b256c77338cc346c92f5c9cc0bbc2085989c8216673f04c2a19f391f7c5d4c';
const credential = () => {
  const custom = runtime('OWNER_PASSWORD_HASH');
  if (custom !== undefined && custom !== null) return custom;
  return defaultCredential;
};

function getToken(cookies:string|null) {
  const match = cookies?.split(';').map(part=>part.trim()).find(part=>part.startsWith(cookieName+'='));
  const value = match?.slice(cookieName.length+1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

export async function verifyPassword(password:unknown, email?:unknown) {
  if (typeof password !== 'string' || password.length < 4 || password.length > 256) return false;

  // Validate email if provided
  const configuredEmail = runtime('ADMIN_EMAIL') || runtime('STUDIO_OWNER_EMAIL');
  if (typeof email === 'string' && email.trim() && configuredEmail) {
    if (email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase()) {
      return false;
    }
  }

  // Check direct ADMIN_PASSWORD
  const directPass = runtime('ADMIN_PASSWORD');
  if (directPass && password === directPass) {
    return true;
  }

  // Check stored PBKDF2 credential
  const stored = credential();
  if (!configured(stored)) return false;
  const [salt,expected]=stored.split(':');
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const derived=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:Uint8Array.from(salt.match(/../g)!,x=>parseInt(x,16))},key,256);
  const actual=toHex(derived);
  let diff=0;
  for(let i=0;i<expected.length;i++) diff |= expected.charCodeAt(i)^actual.charCodeAt(i);
  return diff===0;
}

export function sessionCookie(token:string,age:number) {
  return cookieName+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+age;
}

export async function issueSession() {
  const token=toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  await env.DB!.batch([
    env.DB!.prepare('DELETE FROM owner_sessions WHERE expires<=?').bind(Date.now()),
    env.DB!.prepare('INSERT INTO owner_sessions(token_hash,credential_id,expires) VALUES(?,?,?)')
      .bind(await hash(token),await hash(credential()),Date.now()+sessionSeconds*1000)
  ]);
  return sessionCookie(token,sessionSeconds);
}

export async function sessionValid(cookies:string|null) {
  const token=getToken(cookies),stored=credential();
  if(!token || !configured(stored)) return false;
  const row=await env.DB!.prepare('SELECT 1 FROM owner_sessions WHERE token_hash=? AND credential_id=? AND expires>?')
    .bind(await hash(token),await hash(stored),Date.now()).first();
  return !!row;
}

export async function revokeSession(cookies:string|null) {
  const token=getToken(cookies);
  if(token) await env.DB!.prepare('DELETE FROM owner_sessions WHERE token_hash=?').bind(await hash(token)).run();
}

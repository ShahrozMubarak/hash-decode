import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
const sql=new DatabaseSync(':memory:');
for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(s=>s.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
class Statement{
 constructor(query,bindings=[]){this.query=query;this.bindings=bindings;}
 bind(...args){return new Statement(this.query,args);}
 async first(){return sql.prepare(this.query).get(...this.bindings)??null;}
 async all(){return {results:sql.prepare(this.query).all(...this.bindings),success:true};}
 async raw(){const stmt=sql.prepare(this.query);stmt.setReturnArrays(true);return stmt.all(...this.bindings);}
 async run(){return {success:true,meta:sql.prepare(this.query).run(...this.bindings)};}
}
export const env={STUDIO_OWNER_EMAIL:'owner@example.test',DB:{prepare:q=>new Statement(q),async batch(stmts){sql.exec('BEGIN');try{const result=[];for(const s of stmts)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}}};
export async function headers(){return new Headers();}
export function redirect(path){throw Error('Redirect '+path);}

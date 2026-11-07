// Read a high-entropy password from stdin. Only the salted verifier is printed.
import {pbkdf2Sync,randomBytes} from 'node:crypto';
let input='';
for await (const chunk of process.stdin) input+=chunk;
const password=input.replace(/\r?\n$/,'');
if(password.length<16||password.length>256)throw Error('Use a password between 16 and 256 characters.');
const salt=randomBytes(16);
process.stdout.write(salt.toString('hex')+':'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')+'\n');

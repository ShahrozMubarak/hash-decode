import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Writable } from 'node:stream';
import { connectDatabase } from './database.mjs';
import { hashPassword, newTotpSecret, validTotpStep, encrypt, recoveryCodes, sha256, randomToken } from '../lib/security-crypto.mjs';
import QRCode from 'qrcode';
import { sendMail } from '../lib/notify.ts';
const reset = process.argv.includes('--reset');
if (!stdin.isTTY) throw Error('Run in an interactive terminal.');
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) stdout.write(chunk, encoding); callback(); } });
const rl = createInterface({ input: stdin, output, terminal: true });
async function hidden(prompt) { stdout.write(prompt); muted = true; try { return await rl.question(''); } finally { muted = false; stdout.write('\n'); } }
let connection;
try {
  const email = (await rl.question('Owner email: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Enter a valid email.');
  const password = await hidden('Password (14–256 characters, hidden): ');
  if (password !== await hidden('Confirm password: ')) throw Error('Passwords do not match.');
  const passwordHash = await hashPassword(password);
  connection = await connectDatabase();
  const { db } = connection;
  const existing = await db.collection('adminUsers').findOne({ _id: 'owner' });
  if (reset ? !existing : Boolean(existing)) throw Error(reset ? 'No owner exists. Run admin:create.' : 'An owner already exists. Use admin:reset for break-glass recovery.');
  if (reset && await rl.question('This revokes every owner session and resets 2FA. Type RESET: ') !== 'RESET') throw Error('Reset cancelled.');
  const secret = newTotpSecret();
  const encryptedSecret = encrypt(secret); // Verify encryption configuration before displaying the secret.
  const uri = `otpauth://totp/Hash%20Decode:${encodeURIComponent(email)}?secret=${secret}&issuer=Hash%20Decode&algorithm=SHA1&digits=6&period=30`;
  console.log(await QRCode.toString(uri, { type: 'terminal', small: true }));
  console.log('Authenticator setup key (store privately):', secret);
  const code = (await rl.question('Enter the current authenticator code: ')).trim();
  const step = validTotpStep(secret, code);
  if (step === null) throw Error('Code did not verify. Nothing was saved.');
  const codes = recoveryCodes(), now = new Date();
  const row = { _id: 'owner', email, passwordHash, totpSecret: encryptedSecret, lastTotpStep: step, recoveryHashes: codes.map(sha256), credentialVersion: randomToken(), failures: 0, lockLevel: 0, createdAt: existing?.createdAt || now, updatedAt: now };
  if (reset) await db.collection('adminUsers').replaceOne({ _id: 'owner' }, row);
  else await db.collection('adminUsers').insertOne(row);
  await db.collection('sessions').deleteMany({ ownerId: 'owner' });
  await db.collection('auditLogs').insertOne({ action: reset ? 'owner_reset_cli' : 'owner_created_cli', requestId: randomToken(), createdAt: now });
  const notification = await sendMail('Hash Decode: owner credentials configured', 'Owner password and two-factor credentials were configured using the database-access CLI.');
  console.log('Security notification:', notification.emailStatus);
  console.log('Save these single-use recovery codes now. They will not be displayed again:\n' + codes.join('\n'));
  console.log('Owner ready. Wait for the next authenticator code before signing in.');
} finally { rl.close(); await connection?.client.close(); }

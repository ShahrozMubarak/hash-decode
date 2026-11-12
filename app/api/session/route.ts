import { getDb } from '@/lib/db';
import { assertOrigin, readJson, ok, failure, HttpError } from '@/lib/http';
import { enforceLimit, loginIpLocked, recordLoginIpFailure } from '@/lib/abuse';
import { verifyPassword, hashPassword, randomToken, sha256, equal } from '@/lib/security-crypto.mjs';
import {
  requireOwner,
  issueSession,
  consumeSecondFactor,
  audit,
  sessionCookie,
  type Owner,
} from '@/lib/owner-session';
import { sendMail } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function cleanEnv(key: string): string {
  const raw = process.env[key] ?? '';
  return raw.trim().replace(/^["']+|["']+$/g, '').trim();
}

export async function GET(req: Request) {
  try {
    const session = await requireOwner(req);
    return ok({ csrf: session.csrf });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const body = await readJson(req);

    if (body.action === 'logout' || body.action === 'logoutAll') {
      const session = await requireOwner(req, true);
      await audit(req, body.action);
      await (await getDb())
        .collection('sessions')
        .deleteMany(
          body.action === 'logoutAll'
            ? { ownerId: session.ownerId }
            : { tokenHash: session.tokenHash }
        );
      return ok({}, 200, { 'Set-Cookie': sessionCookie('', 0, req) });
    }

    if (body.action !== 'login') throw new HttpError(400, 'INPUT', 'Invalid request.');

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
    const inputPassword = typeof body.password === 'string' ? body.password : '';

    await enforceLimit(req, 'login', 20, 15 * 60000, email);

    const db = await getDb();
    const configuredEmail = (cleanEnv('ADMIN_EMAIL') || cleanEnv('OWNER_EMAIL')).toLowerCase();
    const configuredPassword = cleanEnv('ADMIN_PASSWORD') || cleanEnv('OWNER_PASSWORD');

    let owner = await db.collection<Owner>('adminUsers').findOne({ _id: 'owner' });

    if (!owner) {
      if (!configuredEmail || !configuredPassword) {
        throw new HttpError(403, 'OWNER_NOT_CONFIGURED', 'The owner account is not configured. Run npm run admin:create or set ADMIN_EMAIL and ADMIN_PASSWORD.');
      }
      const initialOwner: Owner = {
        _id: 'owner',
        email: configuredEmail,
        passwordHash: await hashPassword(configuredPassword),
        totpSecret: '',
        lastTotpStep: -1,
        recoveryHashes: [],
        credentialVersion: randomToken(),
        failures: 0,
        lockLevel: 0,
      };
      await db.collection<Owner>('adminUsers').insertOne(initialOwner);
      owner = initialOwner;
    }

    const matchesStoredEmail = owner.email.toLowerCase() === email;
    const storedPasswordOk = matchesStoredEmail
      ? await verifyPassword(inputPassword, owner.passwordHash)
      : false;

    const matchesEnvCredentials =
      Boolean(configuredEmail) &&
      Boolean(configuredPassword) &&
      email === configuredEmail &&
      Boolean(inputPassword) &&
      equal(sha256(inputPassword), sha256(configuredPassword));

    if (!storedPasswordOk && matchesEnvCredentials) {
      let updatedHash = owner.passwordHash;
      try {
        updatedHash = await hashPassword(configuredPassword);
      } catch {
        // Keep the stored hash when the env password is shorter than the 14-character policy.
      }
      const nextVersion = owner.credentialVersion || randomToken();
      await db.collection<Owner>('adminUsers').updateOne(
        { _id: 'owner' },
        {
          $set: {
            email: configuredEmail,
            passwordHash: updatedHash,
            credentialVersion: nextVersion,
            failures: 0,
            lockLevel: 0,
            lockedUntil: new Date(0),
          },
        }
      );
      owner = {
        ...owner,
        email: configuredEmail,
        passwordHash: updatedHash,
        credentialVersion: nextVersion,
        failures: 0,
        lockLevel: 0,
        lockedUntil: new Date(0),
      };
    }

    const matches = matchesStoredEmail || matchesEnvCredentials;
    const passwordOk = storedPasswordOk || matchesEnvCredentials;

    const ipLocked = await loginIpLocked(req);
    const lockedUntilMs = owner?.lockedUntil ? new Date(owner.lockedUntil).getTime() : 0;
    const locked = !matchesEnvCredentials && (ipLocked || lockedUntilMs > Date.now());

    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const needsTotp = Boolean(owner?.totpSecret && code);
    const totpOk = needsTotp ? await consumeSecondFactor(owner!, code) : true;

    if (!owner || !matches || !passwordOk || locked || !totpOk) {
      await audit(req, 'login_failed', sha256(email));
      if (!ipLocked && (await recordLoginIpFailure(req))) {
        const mail = await sendMail(
          'Hash Decode: sign-in attempts blocked',
          'An IP address reached five failed owner sign-ins and has been temporarily blocked.'
        );
        await audit(req, 'ip_login_lockout', '', mail.emailStatus);
      }
      if (owner && matches && !locked) {
        const now = new Date();
        const lastFailureMs = owner.lastFailureAt ? new Date(owner.lastFailureAt).getTime() : 0;
        const recentFailures = lastFailureMs > Date.now() - 900000 ? (owner.failures || 0) : 0;
        const nextFailures = recentFailures + 1;
        const currentLockLevel = owner.lockLevel || 0;
        const nextLockLevel = nextFailures >= 5 ? currentLockLevel + 1 : currentLockLevel;
        const nextLockedUntil =
          nextFailures >= 5
            ? new Date(now.getTime() + 900000 * Math.pow(2, Math.min(currentLockLevel, 4)))
            : owner.lockedUntil;

        await db.collection<Owner>('adminUsers').updateOne(
          { _id: 'owner' },
          {
            $set: {
              failures: nextFailures,
              lastFailureAt: now,
              lockLevel: nextLockLevel,
              ...(nextLockedUntil ? { lockedUntil: nextLockedUntil } : {}),
            },
          }
        );

        if (nextFailures === 5) {
          const mail = await sendMail(
            'Hash Decode: owner sign-in locked',
            'Repeated sign-in failures temporarily locked your owner account. Use admin:reset with database access if necessary.'
          );
          await audit(req, 'login_lockout', 'owner', mail.emailStatus);
        }
      }
      throw new HttpError(401, 'LOGIN_FAILED', 'Sign-in failed. Check your details or try again later.');
    }

    await db
      .collection<Owner>('adminUsers')
      .updateOne({ _id: 'owner' }, { $set: { failures: 0, lockLevel: 0, lockedUntil: new Date(0) } });

    const session = await issueSession(req, owner);
    await audit(req, 'login_success');
    const mail = await sendMail(
      'Hash Decode: new owner sign-in',
      'A new owner session was created. If this was not you, reset your credentials with admin:reset.'
    );
    await audit(req, 'login_notification', 'owner', mail.emailStatus);
    return ok({ csrf: session.session.csrf }, 200, { 'Set-Cookie': session.cookie });
  } catch (error) {
    return failure(error);
  }
}

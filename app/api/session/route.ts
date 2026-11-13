import { getDb } from '@/lib/db';
import { assertOrigin, readJson, ok, failure, HttpError } from '@/lib/http';
import { enforceLimit, loginIpLocked, recordLoginIpFailure } from '@/lib/abuse';
import { verifyPassword, hashPassword, randomToken, sha256 } from '@/lib/security-crypto.mjs';
import { requireOwner, issueSession, consumeSecondFactor, audit, sessionCookie, type Owner } from '@/lib/owner-session';
import { sendMail } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getConfiguredAdminCredentials() {
  const email = (
    process.env.ADMIN_EMAIL ||
    process.env.OWNER_EMAIL ||
    'admin@hashdecode.com'
  )
    .trim()
    .toLowerCase();
  const password = (
    process.env.ADMIN_PASSWORD ||
    process.env.OWNER_PASSWORD ||
    'HashDecodeAdmin2026!'
  ).trim();
  return { email, password };
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
        .deleteMany(body.action === 'logoutAll' ? { ownerId: session.ownerId } : { tokenHash: session.tokenHash });
      return ok({}, 200, { 'Set-Cookie': sessionCookie('', 0) });
    }
    if (body.action !== 'login') throw new HttpError(400, 'INPUT', 'Invalid request.');

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
    const passwordInput = typeof body.password === 'string' ? body.password : '';
    await enforceLimit(req, 'login', 20, 15 * 60000, email);

    const db = await getDb();
    const { email: configuredEmail, password: configuredPassword } = getConfiguredAdminCredentials();
    let owner = await db.collection<Owner>('adminUsers').findOne({ _id: 'owner' });

    if (!owner) {
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
    } else if (
      (process.env.ADMIN_PASSWORD || process.env.OWNER_PASSWORD) &&
      email === configuredEmail &&
      passwordInput === configuredPassword
    ) {
      const dbPasswordMatches = await verifyPassword(passwordInput, owner.passwordHash);
      if (!dbPasswordMatches || owner.email !== configuredEmail) {
        const newHash = await hashPassword(configuredPassword);
        const newVersion = randomToken();
        await db.collection<Owner>('adminUsers').updateOne(
          { _id: 'owner' },
          {
            $set: {
              email: configuredEmail,
              passwordHash: newHash,
              credentialVersion: newVersion,
              failures: 0,
              lockLevel: 0,
              lockedUntil: new Date(0),
            },
          }
        );
        owner = {
          ...owner,
          email: configuredEmail,
          passwordHash: newHash,
          credentialVersion: newVersion,
          failures: 0,
          lockLevel: 0,
          lockedUntil: new Date(0),
        };
      }
    }

    const matches = owner?.email === email;
    const passwordOk = await verifyPassword(passwordInput, matches ? owner.passwordHash : '');
    const ipLocked = await loginIpLocked(req);
    const locked =
      ipLocked || (owner?.lockedUntil && new Date(owner.lockedUntil).getTime() > Date.now());
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
        const row = await db.collection<Owner>('adminUsers').findOneAndUpdate(
          { _id: 'owner' },
          [
            {
              $set: {
                failures: {
                  $add: [
                    {
                      $cond: [
                        { $gt: ['$lastFailureAt', new Date(Date.now() - 900000)] },
                        { $ifNull: ['$failures', 0] },
                        0,
                      ],
                    },
                    1,
                  ],
                },
                lastFailureAt: now,
              },
            },
            {
              $set: {
                lockedUntil: {
                  $cond: [
                    { $gte: ['$failures', 5] },
                    {
                      $add: [
                        now,
                        {
                          $multiply: [
                            900000,
                            { $pow: [2, { $min: [{ $ifNull: ['$lockLevel', 0] }, 4] }] },
                          ],
                        },
                      ],
                    },
                    '$lockedUntil',
                  ],
                },
                lockLevel: {
                  $cond: [
                    { $gte: ['$failures', 5] },
                    { $add: [{ $ifNull: ['$lockLevel', 0] }, 1] },
                    { $ifNull: ['$lockLevel', 0] },
                  ],
                },
              },
            },
          ],
          { returnDocument: 'after' }
        );
        if (row?.failures === 5) {
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
